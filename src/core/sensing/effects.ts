import type { ConditionEffect, EffectTarget } from "@/core/planner/conditions";
import { ADDITIVE_EFFECT, EFFECT_ALPHA, TRAVEL_TIME_POLICY } from "@/core/sensing/policy";
import type { TransitEvent, TravelTimeAggregate } from "@/core/sensing/types";
import { ROAD_MODES, type Route } from "@/core/transit/types";

const ROAD_AND_FOOT: EffectTarget[] = [...ROAD_MODES, "walk"];

export interface EffectContext {
  getRoute: (routeId: string) => Route | undefined;
  /** Current headway of a route in minutes. */
  headwayOf: (route: Route) => number;
}

/**
 * Translates an active event into one graph operation, scaled by its
 * confidence C: w = w₀ · (1 + αₖ · C) for area conditions, C × the reported
 * minutes for delays, C × a headway of boarding wait for full vehicles. Only
 * blocking events disable edges, and a full vehicle never disables a route —
 * it adds a wait for that service at that stop only.
 */
export function eventEffect(event: TransitEvent, context: EffectContext): ConditionEffect | null {
  if (event.status !== "uncertain" && event.status !== "corroborated") return null;
  const c = Math.min(1, Math.max(0, event.confidence));
  const base = { event_id: event.id, stop_id: event.stop_id };

  switch (event.category) {
    case "delay": {
      const route = event.route_id ? context.getRoute(event.route_id) : undefined;
      if (!route) return null;
      const reported = event.details.delay_mins ?? ADDITIVE_EFFECT.default_delay_mins;
      return {
        ...base,
        kind: "slowdown",
        route_id: route.id,
        targets: [route.mode],
        scope: "departing",
        factor: 1,
        added_mins: reported * c,
      };
    }
    case "full_vehicle": {
      const route = event.route_id ? context.getRoute(event.route_id) : undefined;
      if (!route) return null;
      return {
        ...base,
        kind: "boarding_wait",
        route_id: route.id,
        added_mins: context.headwayOf(route) * ADDITIVE_EFFECT.full_vehicle_headways * c,
      };
    }
    case "flooding": {
      if (event.blocking) return { ...base, kind: "closure", targets: ROAD_AND_FOOT };
      const alpha = EFFECT_ALPHA.flooding[event.details.flood_level ?? "passable"];
      return {
        ...base,
        kind: "slowdown",
        route_id: null,
        targets: ROAD_AND_FOOT,
        scope: "incident",
        factor: 1 + alpha * c,
        added_mins: 0,
      };
    }
    case "road_disruption": {
      if (event.blocking) return { ...base, kind: "closure", targets: [...ROAD_MODES] };
      const alpha = EFFECT_ALPHA.road_disruption[event.details.road_status ?? "slow"];
      return {
        ...base,
        kind: "slowdown",
        route_id: null,
        targets: [...ROAD_MODES],
        scope: "departing",
        factor: 1 + alpha * c,
        added_mins: 0,
      };
    }
  }
}

/** Aggregated GPS travel times replace baseline hop times where well supported. */
export function travelTimeEffects(aggregates: readonly TravelTimeAggregate[]): ConditionEffect[] {
  return aggregates
    .filter(
      (aggregate) =>
        aggregate.samples >= TRAVEL_TIME_POLICY.min_samples &&
        aggregate.contributors >= TRAVEL_TIME_POLICY.min_contributors
    )
    .map((aggregate) => ({
      kind: "observed_time",
      route_id: aggregate.route_id,
      from_stop_id: aggregate.from_stop_id,
      to_stop_id: aggregate.to_stop_id,
      minutes: aggregate.median_mins,
      samples: aggregate.samples,
    }));
}

/** Plain-language consequence of an effect, for alerts. */
export function describeEffect(effect: ConditionEffect | null, routeName?: string): string {
  if (!effect) return "No change to route recommendations.";
  switch (effect.kind) {
    case "closure":
      return effect.targets.includes("walk")
        ? "Treated as impassable: trips are routed around this stop, on foot too."
        : "Treated as closed to vehicles: trips are routed around this stop.";
    case "slowdown":
      if (effect.factor > 1) {
        return `Travel ${effect.scope === "departing" ? "leaving" : "near"} this stop estimated ${Math.round((effect.factor - 1) * 100)}% slower.`;
      }
      return `Adds about ${Math.round(effect.added_mins)} min${routeName ? ` to ${routeName}` : ""} from this stop.`;
    case "boarding_wait":
      return `Expect to wait about ${Math.round(effect.added_mins)} min more to board${routeName ? ` ${routeName}` : ""} here.`;
    case "forecast":
      return `Forecast rain: travel near here estimated ${Math.round((effect.factor - 1) * 100)}% slower.`;
    case "observed_time":
      return `Uses an observed travel time of ${Math.round(effect.minutes)} min (${effect.samples} rides).`;
  }
}
