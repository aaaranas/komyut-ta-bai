import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { aggregateTravelTimes, deriveSegments, type TracePoint } from "@/core/sensing/traces";
import type { Route, Stop } from "@/core/transit/types";

const stops: Stop[] = [0, 1, 2].map((i) => ({
  id: `S${i}`,
  name: `S${i}`,
  lat: 10.3 + i * 0.01,
  lng: 123.9,
  municipality: "Test",
  type: "street_stop",
}));
const route: Route = {
  id: "R",
  name: "R",
  mode: "jeepney",
  operator: "Test",
  stop_ids: stops.map((s) => s.id),
  fare: { kind: "flat", amount: 13 },
  duration_mins: 10,
  direction: "one_way",
  service: { kind: "frequency", windows: [], evidence: "published" },
  provenance: { status: "verified", date: "2026-01-01" },
};

/** A fix every 30 s moving north at ~1.1 km per 4 minutes. */
function ride(accuracy = 10): TracePoint[] {
  const points: TracePoint[] = [];
  for (let i = 0; i <= 16; i++) {
    points.push({ t: i * 30_000, lat: 10.3 + (i / 8) * 0.01, lng: 123.9, accuracy_m: accuracy });
  }
  return points;
}

describe("GPS trace segments", () => {
  it("derives adjacent stop-to-stop times", () => {
    const { segments } = deriveSegments(route, stops, ride(), () => 5);
    assert.deepEqual(
      segments.map((s) => [s.from_stop_id, s.to_stop_id, s.minutes]),
      [
        ["S0", "S1", 4],
        ["S1", "S2", 4],
      ]
    );
  });

  it("drops inaccurate fixes", () => {
    const { segments, quality } = deriveSegments(route, stops, ride(200), () => 5);
    assert.equal(segments.length, 0);
    assert.equal(quality.points_used, 0);
  });

  it("rejects travel against a one-way route", () => {
    const reversed = ride().map((p, i, all) => ({ ...p, t: all[all.length - 1 - i].t }));
    assert.equal(deriveSegments(route, stops, reversed, () => 5).segments.length, 0);
  });

  it("publishes aggregates only as medians over recent rides", () => {
    const now = new Date("2026-10-19T08:00:00Z");
    const observation = (minutes: number, contributor: string) => ({
      id: `${minutes}${contributor}`,
      route_id: "R",
      from_stop_id: "S0",
      to_stop_id: "S1",
      minutes,
      observed_at: new Date(now.getTime() - 10 * 60_000).toISOString(),
      contributor,
      trace_id: "t",
      replay: null,
    });
    const [aggregate] = aggregateTravelTimes(
      [observation(4, "a"), observation(6, "b"), observation(20, "c")],
      now
    );
    assert.equal(aggregate.median_mins, 6);
    assert.equal(aggregate.contributors, 3);
  });
});
