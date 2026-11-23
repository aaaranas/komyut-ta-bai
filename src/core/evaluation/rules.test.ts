import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { toCsv } from "@/core/evaluation/csv";
import { compareRules, propagationStats } from "@/core/evaluation/metrics";
import { confidenceAdmitted, countOnlyAdmitted } from "@/core/evaluation/rules";
import { deriveEvents, reportEvidence } from "@/core/sensing/events";
import type { Report, ReportLabel } from "@/core/sensing/types";

const NOW = new Date("2026-11-23T08:00:00Z");
const ago = (mins: number) => new Date(NOW.getTime() - mins * 60_000).toISOString();

function report(id: string, contributor: string, stop: string, extra: Partial<Report> = {}): Report {
  return {
    id,
    category: "flooding",
    kind: "observation",
    stop_id: stop,
    route_id: null,
    details: { flood_level: "passable" },
    contributor,
    observed_at: ago(5),
    submitted_at: ago(5),
    distance_to_stop_m: null,
    withdrawn_at: null,
    replay: null,
    ...extra,
  };
}
const label = (id: string, truth: boolean, split: "dev" | "test" = "dev"): ReportLabel => ({
  report_id: id,
  label: truth ? "true" : "false",
  basis: "field_observation",
  labeled_at: ago(0),
  split,
});

describe("count-only rule", () => {
  it("publishes once two distinct accounts agree, regardless of reputation or location", () => {
    const reports = [
      report("a1", "u1", "A"),
      report("a2", "u1", "A"), // same account twice: still one source
      report("b1", "u1", "B"),
      report("b2", "u2", "B"),
    ];
    const admitted = countOnlyAdmitted(reportEvidence(reports, new Map()), NOW);
    assert.deepEqual([...admitted].sort(), ["b1", "b2"]);
  });
});

describe("rule comparison", () => {
  // Hand-made table. Stop A: one new contributor without location (C = 0.425 < θ_pub, so the confidence
  // rule rejects; count-only rejects too). Stop B: two new contributors (C ≈ 0.67, both rules admit).
  // Stop C: two confirmations from 2 km away (each 0.5 · 0.6 · 0.6 = 0.18, so C = 1 − 0.82² ≈ 0.33 < θ_pub:
  // the confidence rule never publishes; count-only admits because two accounts agree).
  const reports = [
    report("A1", "u1", "A"),
    report("B1", "u2", "B"),
    report("B2", "u3", "B"),
    report("C1", "u4", "C", { kind: "confirmation", distance_to_stop_m: 2000 }),
    report("C2", "u5", "C", { kind: "confirmation", distance_to_stop_m: 2000 }),
  ];
  const evidence = reportEvidence(reports, new Map());
  const events = deriveEvents(evidence, NOW);

  it("scores both rules on the same labels and tests their disagreements", () => {
    // C1, C2 are false reports: count-only wrongly admits them, the confidence rule correctly rejects.
    const labels = [label("A1", true), label("B1", true), label("B2", true), label("C1", false), label("C2", false)];
    const result = compareRules(reports, labels, confidenceAdmitted(events), countOnlyAdmitted(evidence, NOW));
    assert.equal(result.confidence.true_positive, 2);
    assert.equal(result.confidence.false_negative, 1);
    assert.equal(result.confidence.true_negative, 2);
    assert.equal(result.count_only.false_positive, 2);
    assert.equal(result.disagreements, 2);
    assert.equal(result.mcnemar.b, 2);
    assert.equal(result.mcnemar.c, 0);
    assert.equal(result.mcnemar.p, 0.5); // exact: 2 · 0.5² = 0.5
    assert.equal(result.confidence.false_admission.value, 0);
    assert.equal(result.count_only.false_admission.value, 1);
    assert.ok(result.count_only.false_admission.ci!.lower > 0.3);
  });

  it("keeps the dev and test sets apart", () => {
    const labels = [label("A1", true, "test"), label("B1", true), label("B2", true)];
    const dev = compareRules(reports, labels, confidenceAdmitted(events), countOnlyAdmitted(evidence, NOW), "dev");
    const test = compareRules(reports, labels, confidenceAdmitted(events), countOnlyAdmitted(evidence, NOW), "test");
    assert.equal(dev.confidence.labeled, 2);
    assert.equal(test.confidence.labeled, 1);
  });
});

describe("propagation", () => {
  it("measures source time to the first route response, excluding replays", () => {
    const events = deriveEvents(reportEvidence([report("B1", "u2", "B"), report("B2", "u3", "B")], new Map()), NOW);
    const [event] = events;
    const stats = propagationStats(events, [{ event_id: event.id, source_at: ago(5), first_route_response_at: ago(3) }]);
    assert.equal(stats.median_mins, 2);
    assert.equal(stats.p90_mins, 2);
    const replayed = propagationStats([{ ...event, replay: true }], []);
    assert.equal(replayed.events, 0);
  });
});

describe("CSV", () => {
  it("quotes fields, doubles quotes, and defuses spreadsheet formulas", () => {
    const csv = toCsv([{ a: 'say "hi", ok', b: "=SUM(A1)", c: 1.23456, d: null }], ["a", "b", "c", "d"]);
    assert.equal(csv, 'a,b,c,d\r\n"say ""hi"", ok",\'=SUM(A1),1.235,\r\n');
  });
});
