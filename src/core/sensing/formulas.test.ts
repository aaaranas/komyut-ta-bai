import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { compileConditions, edgeCost } from "@/core/planner/conditions";
import type { RideEdge } from "@/core/planner/graph";
import { deriveEvents, reportEvidence } from "@/core/sensing/events";
import { eventEffect } from "@/core/sensing/effects";
import { EFFECT_ALPHA, THRESHOLDS } from "@/core/sensing/policy";
import { betaReputation } from "@/core/sensing/reputation";
import type { Report, ReportDetails } from "@/core/sensing/types";
import type { Route } from "@/core/transit/types";

const NOW = new Date("2026-11-23T08:00:00Z");
const ago = (mins: number) => new Date(NOW.getTime() - mins * 60_000).toISOString();
const close = (actual: number, expected: number, digits = 3) =>
  assert.ok(Math.abs(actual - expected) < 10 ** -digits, `${actual} ≈ ${expected}`);

let n = 0;
function report(details: ReportDetails, observedAgo: number, submittedAgo = observedAgo): Report {
  n += 1;
  return {
    id: `f${n}`,
    category: "flooding",
    kind: "observation",
    stop_id: "S",
    route_id: null,
    details,
    contributor: `c${n}`,
    observed_at: ago(observedAgo),
    submitted_at: ago(submittedAgo),
    distance_to_stop_m: 50,
    withdrawn_at: null,
    replay: null,
  };
}

const events = (reports: Report[]) => deriveEvents(reportEvidence(reports, new Map()), NOW);

const ROUTE = { id: "R", mode: "jeepney" } as Route;
const context = { getRoute: () => ROUTE, headwayOf: () => 10 };
const hop: RideEdge = { kind: "ride", from: "S", to: "T", route_id: "R", mode: "jeepney", minutes: 10, km: 1, offset_mins: 0 };

describe("thesis formulas, hand-calculated", () => {
  it("R = (r + 1) / (r + s + 2)", () => {
    close(betaReputation(3, 1), 4 / 6); // (3 + 1) / (3 + 1 + 2) = 0.667
    assert.equal(betaReputation(0, 0), 0.5);
  });

  it("C = 1 − ∏(1 − Rᵢ e^(−Δt/τ)): two new contributors at age 0 give 0.75", () => {
    const [event] = events([report({ flood_level: "passable" }, 0), report({ flood_level: "passable" }, 0)]);
    close(event.confidence, 1 - 0.5 * 0.5); // 0.75
    assert.equal(event.status, "corroborated");
  });

  it("decays with the category time constant (flooding half-life 60 min ⇒ τ = 60 / ln 2)", () => {
    const [event] = events([report({ flood_level: "passable" }, 60)]);
    close(event.confidence, 0.5 * Math.exp(-60 / (60 / Math.LN2))); // 0.25
  });

  it("publishes at θ_pub and expires only below θ_exp (no flicker)", () => {
    assert.ok(THRESHOLDS.expire < THRESHOLDS.publish);
    // One new on-site contributor: C = 0.5 · 0.5^(t/60). Published on arrival (C = 0.5 ≥ 0.45).
    const [held] = events([report({ flood_level: "passable" }, 31)]); // C ≈ 0.349
    close(held.confidence, 0.5 * 0.5 ** (31 / 60));
    assert.equal(held.status, "uncertain");
    const [gone] = events([report({ flood_level: "passable" }, 45)]); // C ≈ 0.297 < 0.30
    assert.equal(gone.status, "expired");
    // Arriving late at the same confidence, it was never published: stays pending.
    const [late] = events([report({ flood_level: "passable" }, 31, 0)]);
    assert.equal(late.status, "pending");
    assert.equal(late.published_at, null);
  });

  it("w(e) = w₀(e) · (1 + αₖ · C), never below w₀", () => {
    const [event] = events([report({ flood_level: "passable" }, 0), report({ flood_level: "passable" }, 0)]);
    const effect = eventEffect(event, context)!;
    assert.equal(effect.kind, "slowdown");
    const cost = edgeCost(hop, compileConditions([effect]))!;
    close(cost.minutes, 10 * (1 + EFFECT_ALPHA.flooding.passable * 0.75)); // 12.25
    assert.ok(cost.minutes >= hop.minutes);
  });

  it("w(e) = ∞ only for an impassable event with C ≥ θ_block and independent agreement", () => {
    const blocking = events([report({ flood_level: "impassable" }, 0), report({ flood_level: "impassable" }, 0), report({ flood_level: "impassable" }, 0)]);
    // 1 − 0.5³ = 0.875 ≥ 0.8 with 3 independent sources
    close(blocking[0].confidence, 0.875);
    assert.ok(blocking[0].blocking);
    assert.equal(edgeCost(hop, compileConditions([eventEffect(blocking[0], context)!])), null);

    const two = events([report({ flood_level: "impassable" }, 0), report({ flood_level: "impassable" }, 0)]);
    assert.ok(!two[0].blocking, "0.75 < θ_block");
    const cost = edgeCost(hop, compileConditions([eventEffect(two[0], context)!]))!;
    close(cost.minutes, 10 * (1 + EFFECT_ALPHA.flooding.impassable * 0.75)); // 17.5
  });

  it("delays and full vehicles scale additively by C", () => {
    const delay = { ...events([report({ flood_level: "passable" }, 0)])[0], category: "delay" as const, details: { delay_mins: 20 }, route_id: "R" };
    const effect = eventEffect(delay, context)!;
    assert.equal(effect.kind === "slowdown" && effect.added_mins, 20 * 0.5);
    const full = { ...delay, category: "full_vehicle" as const, details: {} };
    const wait = eventEffect(full, context)!;
    assert.equal(wait.kind === "boarding_wait" && wait.added_mins, 10 * 0.5);
  });
});
