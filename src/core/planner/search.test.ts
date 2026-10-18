import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { compileConditions } from "@/core/planner/conditions";
import { buildGraph } from "@/core/planner/graph";
import { planJourney, retimeItinerary } from "@/core/planner";
import { planOnGraph, retimeOnGraph } from "@/core/planner/search";
import type { PlanRequest } from "@/core/planner/types";
import { normalizeNetwork } from "@/core/transit/normalize";
import type { RouteRecord, StopRecord } from "@/data/schema";

// Four stops ~1.1 km apart along a meridian.
const stop = (id: string, lat: number): StopRecord => ({
  id,
  name: id,
  lat,
  lng: 123.9,
  municipality: "Test",
  type: "street_stop",
});
const route = (overrides: Partial<RouteRecord> & Pick<RouteRecord, "id" | "stops">): RouteRecord => ({
  name: overrides.id,
  mode: "jeepney",
  operator: "Test",
  fare: { base_fare: 15, flat: true },
  duration_mins: 30,
  frequency_mins: 10,
  first_trip: "05:00",
  last_trip: "21:00",
  verified_date: "2026-01-01",
  ...overrides,
});
const seq = (...ids: string[]) => ids.map((stop_id, i) => ({ stop_id, sequence: i + 1 }));

const network = normalizeNetwork(
  [stop("A", 10.30), stop("B", 10.31), stop("C", 10.32), stop("D", 10.33)],
  [
    route({ id: "R1", stops: seq("A", "B", "C"), direction: "one_way" }),
    route({ id: "R2", stops: seq("C", "D"), mode: "mybus", frequency_mins: 20, duration_mins: 10 }),
  ],
  []
);
const graph = buildGraph(network);
const at = (minutes: number): PlanRequest["depart"] => ({ dow: 1, minutes });
const request = (overrides: Partial<PlanRequest> = {}): PlanRequest => ({
  origin: "A",
  destination: "D",
  preference: "fastest",
  depart: at(8 * 60),
  ...overrides,
});

describe("time-dependent planner", () => {
  it("adds half-headway waits and charges one fare per vehicle", () => {
    const outcome = planOnGraph(graph, request());
    assert.equal(outcome.status, "ok");
    if (outcome.status !== "ok") return;
    const { itinerary } = outcome;
    assert.equal(itinerary.rides, 2);
    assert.equal(itinerary.waiting_mins, 5 + 10);
    assert.equal(Math.round(itinerary.riding_mins), 40);
    assert.equal(Math.round(itinerary.total_mins), 55);
    assert.equal(itinerary.fare, 30);
  });

  it("never reverses a one-way route", () => {
    const outcome = planOnGraph(graph, request({ origin: "C", destination: "A" }));
    assert.equal(outcome.status, "no_route");
  });

  it("reverses a both-ways route", () => {
    const outcome = planOnGraph(graph, request({ origin: "D", destination: "C" }));
    assert.equal(outcome.status, "ok");
  });

  it("waits for the first trip before service starts", () => {
    const outcome = planOnGraph(graph, request({ destination: "B", depart: at(4 * 60) }));
    assert.equal(outcome.status, "ok");
    if (outcome.status !== "ok") return;
    assert.equal(outcome.itinerary.waiting_mins, 60);
  });

  it("respects the ride limit", () => {
    const outcome = planOnGraph(graph, request({ maxRides: 1 }));
    assert.equal(outcome.status, "no_route");
  });

  it("removes edges at a verified closure and reports what blocked the old route", () => {
    const baseline = planOnGraph(graph, request());
    assert.equal(baseline.status, "ok");
    if (baseline.status !== "ok") return;
    const conditions = compileConditions([
      { kind: "closure", event_id: "ev-flood", stop_id: "B", targets: ["jeepney", "walk"] },
    ]);
    assert.equal(planOnGraph(graph, request({ conditions })).status, "no_route");
    const retimed = retimeOnGraph(graph, baseline.itinerary, request({ conditions }));
    assert.deepEqual(retimed, { status: "blocked", event_ids: ["ev-flood"] });
  });

  it("counts a departing delay once for a vehicle passing through", () => {
    const conditions = compileConditions([
      {
        kind: "slowdown",
        event_id: "ev-delay",
        stop_id: "B",
        route_id: "R1",
        targets: ["jeepney"],
        scope: "departing",
        factor: 1,
        added_mins: 20,
      },
    ]);
    const outcome = planOnGraph(graph, request({ destination: "C", conditions }));
    assert.equal(outcome.status, "ok");
    if (outcome.status !== "ok") return;
    assert.equal(Math.round(outcome.itinerary.riding_mins), 30 + 20);
    assert.deepEqual(outcome.itinerary.event_ids, ["ev-delay"]);
  });

  it("adds a boarding wait for full vehicles without disabling the route", () => {
    const conditions = compileConditions([
      { kind: "boarding_wait", event_id: "ev-full", stop_id: "A", route_id: "R1", added_mins: 10 },
    ]);
    const outcome = planOnGraph(graph, request({ destination: "B", conditions }));
    assert.equal(outcome.status, "ok");
    if (outcome.status !== "ok") return;
    assert.equal(outcome.itinerary.waiting_mins, 15);
  });

  it("charges distance fares beyond the base kilometres", () => {
    const distance = normalizeNetwork(
      [stop("A", 10.3), stop("Z", 10.39)],
      [route({ id: "P", stops: seq("A", "Z"), fare: { base_fare: 13, per_km: 2 } })],
      []
    );
    const outcome = planOnGraph(buildGraph(distance), request({ destination: "Z" }));
    assert.equal(outcome.status, "ok");
    if (outcome.status !== "ok") return;
    // ~10 km on a jeepney: ₱13 for the first 4 km + ₱2/km after.
    const { km } = outcome.itinerary.legs[0] as { km: number };
    assert.equal(outcome.itinerary.fare, Math.round(13 + (km - 4) * 2));
  });
});

describe("curated dataset", () => {
  it("plans Argao to Santa Fe across bus, walk, and ferry", () => {
    const outcome = planJourney({
      origin: "argao-terminal",
      destination: "santafe-town",
      preference: "fastest",
      depart: at(6 * 60),
    });
    assert.equal(outcome.status, "ok");
    if (outcome.status !== "ok") return;
    const modes = outcome.itinerary.legs.map((leg) => (leg.kind === "ride" ? leg.route.mode : "walk"));
    assert.ok(modes.includes("ferry"));
    const retimed = retimeItinerary(outcome.itinerary, {
      origin: "argao-terminal",
      destination: "santafe-town",
      preference: "fastest",
      depart: at(6 * 60),
    });
    assert.equal(retimed.status, "ok");
  });

  it("finds a cheapest plan no slower than the bound", () => {
    const base = { origin: "mybus-anjo-world", destination: "mybus-parkmall", depart: at(9 * 60) };
    const fastest = planJourney({ ...base, preference: "fastest" });
    const cheapest = planJourney({ ...base, preference: "cheapest" });
    assert.equal(fastest.status, "ok");
    assert.equal(cheapest.status, "ok");
    if (fastest.status !== "ok" || cheapest.status !== "ok") return;
    assert.ok(cheapest.itinerary.fare <= fastest.itinerary.fare);
  });
});
