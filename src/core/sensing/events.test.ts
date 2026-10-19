import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { verificationMetrics } from "@/core/evaluation/metrics";
import { officialEvidence } from "@/core/hazards/interpret";
import type { OfficialObservation } from "@/core/hazards/types";
import { deriveEvents, reportEvidence } from "@/core/sensing/events";
import { eventEffect } from "@/core/sensing/effects";
import { betaReputation, buildReputations } from "@/core/sensing/reputation";
import type { Report, ReportLabel } from "@/core/sensing/types";

const NOW = new Date("2026-10-19T08:00:00Z");
const minutesAgo = (m: number) => new Date(NOW.getTime() - m * 60_000).toISOString();

let counter = 0;
function report(overrides: Partial<Report> = {}): Report {
  counter += 1;
  const at = overrides.observed_at ?? minutesAgo(5);
  return {
    id: `r${counter}`,
    category: "flooding",
    kind: "observation",
    stop_id: "S",
    route_id: null,
    details: { flood_level: "impassable" },
    contributor: `c${counter}`,
    observed_at: at,
    submitted_at: overrides.submitted_at ?? at,
    distance_to_stop_m: 50,
    withdrawn_at: null,
    replay: null,
    ...overrides,
  };
}

const events = (reports: Report[], labels: ReportLabel[] = [], now = NOW) =>
  deriveEvents(reportEvidence(reports, buildReputations(reports, labels, now)), now);

describe("verification and confidence", () => {
  it("keeps a single new contributor without location pending", () => {
    const [event] = events([report({ distance_to_stop_m: null, observed_at: minutesAgo(0) })]);
    assert.equal(event.status, "pending");
    assert.equal(event.published_at, null);
  });

  it("publishes one on-site report as uncertain", () => {
    const [event] = events([report({ observed_at: minutesAgo(0) })]);
    assert.equal(event.status, "uncertain");
    assert.ok(Math.abs(event.confidence - 0.5) < 1e-9);
  });

  it("needs independent agreement before blocking", () => {
    const two = events([report({ observed_at: minutesAgo(0) }), report({ observed_at: minutesAgo(0) })]);
    assert.equal(two[0].status, "corroborated");
    assert.equal(two[0].blocking, false);
    const three = events([
      report({ observed_at: minutesAgo(0) }),
      report({ observed_at: minutesAgo(0) }),
      report({ observed_at: minutesAgo(0) }),
    ]);
    assert.equal(three[0].blocking, true);
    assert.equal(eventEffect(three[0], { getRoute: () => undefined, headwayOf: () => 10 })?.kind, "closure");
  });

  it("counts repeat submissions from one pseudonym once", () => {
    const [event] = events([
      report({ contributor: "same", observed_at: minutesAgo(2) }),
      report({ contributor: "same", observed_at: minutesAgo(1) }),
      report({ contributor: "same", observed_at: minutesAgo(0) }),
    ]);
    assert.equal(event.independent_sources, 1);
    assert.equal(event.status, "uncertain");
  });

  it("weights confirmations below observations", () => {
    const [observed] = events([report({ observed_at: minutesAgo(0) }), report({ observed_at: minutesAgo(0) })]);
    const [confirmed] = events([
      report({ observed_at: minutesAgo(0) }),
      report({ kind: "confirmation", observed_at: minutesAgo(0) }),
    ]);
    assert.ok(confirmed.confidence < observed.confidence);
  });

  it("lets full-vehicle reports fade within half an hour", () => {
    const [event] = events([
      report({ category: "full_vehicle", route_id: "R", details: {}, observed_at: minutesAgo(35) }),
    ]);
    assert.equal(event.status, "expired");
  });

  it("records publication at the arrival that crossed the threshold", () => {
    const [event] = events([
      report({ distance_to_stop_m: null, observed_at: minutesAgo(10) }),
      report({ distance_to_stop_m: null, observed_at: minutesAgo(4) }),
    ]);
    assert.equal(event.published_at, minutesAgo(4));
  });

  it("is cleared by stronger clearance evidence", () => {
    const [event] = events([
      report({ observed_at: minutesAgo(20) }),
      report({ kind: "clearance", details: {}, observed_at: minutesAgo(5) }),
      report({ kind: "clearance", details: {}, observed_at: minutesAgo(3) }),
    ]);
    assert.equal(event.status, "cleared");
  });

  it("holds a confirmed closure past its decay until someone clears it", () => {
    const blocked = [
      report({ observed_at: minutesAgo(7 * 60) }),
      report({ observed_at: minutesAgo(7 * 60) }),
      report({ observed_at: minutesAgo(7 * 60) }),
    ];
    const [held] = events(blocked);
    assert.equal(held.status, "corroborated");
    assert.equal(held.blocking, true);

    const [cleared] = events([...blocked, report({ kind: "clearance", details: {}, observed_at: minutesAgo(10) })]);
    assert.equal(cleared.blocking, false);
  });

  it("does not merge delays on different services", () => {
    const list = events([
      report({ category: "delay", route_id: "R1", details: { delay_mins: 15 } }),
      report({ category: "delay", route_id: "R2", details: { delay_mins: 15 } }),
    ]);
    assert.equal(list.length, 2);
  });

  it("ignores withdrawn reports", () => {
    const list = events([report({ withdrawn_at: minutesAgo(1) })]);
    assert.equal(list.length, 0);
  });
});

describe("official evidence", () => {
  const stops = [{ id: "S", name: "S", lat: 10.3, lng: 123.9, municipality: "T", type: "street_stop" as const }];
  const reading = (connection: OfficialObservation["connection"], value: number): OfficialObservation => ({
    id: `o-${connection}-${value}`,
    source: "dost_asti",
    kind: "sensor_reading",
    title: "Water level",
    summary: "",
    area: { label: "S", lat: 10.3, lng: 123.9, radius_km: 0.5 },
    reading: { metric: "water_level_m", value, threshold: 1 },
    observed_at: minutesAgo(1),
    valid_until: null,
    connection,
    replay: null,
  });

  it("lets a manually entered reading alone reach only uncertain", () => {
    const [event] = deriveEvents(officialEvidence([reading("manual", 2)], stops, NOW), NOW);
    assert.equal(event.status, "uncertain");
    assert.equal(event.blocking, false);
  });

  it("ignores readings below threshold", () => {
    assert.equal(officialEvidence([reading("live", 0.5)], stops, NOW).length, 0);
  });

  it("counts repeated readings from one station as one source", () => {
    const first = { ...reading("manual", 2), id: "o-first" };
    const second = { ...reading("manual", 2), id: "o-second" };
    const [event] = deriveEvents(officialEvidence([first, second], stops, NOW), NOW);
    assert.equal(event.independent_sources, 1);
    assert.equal(event.status, "uncertain");
  });

  it("never blocks on a single source, however credible", () => {
    const [event] = deriveEvents(officialEvidence([reading("live", 2)], stops, NOW), NOW);
    assert.equal(event.status, "corroborated");
    assert.equal(event.blocking, false);
  });
});

describe("reputation", () => {
  it("starts at 0.5 and moves only with independent labels", () => {
    assert.equal(betaReputation(0, 0), 0.5);
    const reports = [report({ contributor: "x" }), report({ contributor: "x" }), report({ contributor: "x" })];
    const labels: ReportLabel[] = reports.map((r) => ({
      report_id: r.id,
      label: "true",
      basis: "field_observation",
      labeled_at: NOW.toISOString(),
    }));
    const reputation = buildReputations(reports, labels, NOW).get("x");
    assert.ok(reputation && Math.abs(reputation.score - 0.8) < 1e-9);
  });
});

describe("verification metrics", () => {
  it("counts false admissions and false rejections", () => {
    const admitted = report({ observed_at: minutesAgo(0) });
    const rejected = report({ stop_id: "T", distance_to_stop_m: null, observed_at: minutesAgo(0) });
    const list = events([admitted, rejected]);
    const metrics = verificationMetrics(
      [admitted, rejected],
      [
        { report_id: admitted.id, label: "false", basis: "controlled_scenario", labeled_at: NOW.toISOString() },
        { report_id: rejected.id, label: "true", basis: "controlled_scenario", labeled_at: NOW.toISOString() },
      ],
      list
    );
    assert.equal(metrics.false_positive, 1);
    assert.equal(metrics.false_negative, 1);
    assert.equal(metrics.precision, 0);
  });
});
