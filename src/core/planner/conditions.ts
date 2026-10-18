import type { Edge, RideEdge } from "@/core/planner/graph";
import type { Mode } from "@/core/transit/types";

/** What an effect applies to: a vehicle mode, or people on foot. */
export type EffectTarget = Mode | "walk";

/**
 * A graph operation derived from a verified event or an aggregated
 * observation. Each kind keeps a distinct meaning: a closure removes edges,
 * a slowdown inflates their time, a boarding wait applies only to boarding
 * one route at one stop, and an observed time replaces the baseline.
 */
export type ConditionEffect =
  | { kind: "closure"; event_id: string; stop_id: string; targets: EffectTarget[] }
  | {
      kind: "slowdown";
      event_id: string;
      stop_id: string;
      /** Null = every listed target at the stop. */
      route_id: string | null;
      targets: EffectTarget[];
      /**
       * "incident" affects hops into and out of the stop (an area condition);
       * "departing" only hops leaving it, so a late vehicle passing through
       * is counted once.
       */
      scope: "incident" | "departing";
      factor: number;
      added_mins: number;
    }
  | {
      kind: "boarding_wait";
      event_id: string;
      stop_id: string;
      route_id: string;
      added_mins: number;
    }
  | {
      kind: "observed_time";
      route_id: string;
      from_stop_id: string;
      to_stop_id: string;
      minutes: number;
      samples: number;
    };

type Slowdown = Extract<ConditionEffect, { kind: "slowdown" }>;
type Closure = Extract<ConditionEffect, { kind: "closure" }>;
type BoardingWait = Extract<ConditionEffect, { kind: "boarding_wait" }>;

export interface CompiledConditions {
  closures: ReadonlyMap<string, Closure[]>;
  slowdowns: ReadonlyMap<string, Slowdown[]>;
  boardingWaits: ReadonlyMap<string, BoardingWait[]>;
  observed: ReadonlyMap<string, number>;
}

export const NO_CONDITIONS: CompiledConditions = {
  closures: new Map(),
  slowdowns: new Map(),
  boardingWaits: new Map(),
  observed: new Map(),
};

const hopKey = (routeId: string, from: string, to: string) => `${routeId}|${from}|${to}`;

function group<T extends { stop_id: string }>(items: T[]): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) map.set(item.stop_id, [...(map.get(item.stop_id) ?? []), item]);
  return map;
}

export function compileConditions(effects: readonly ConditionEffect[]): CompiledConditions {
  const closures: Closure[] = [];
  const slowdowns: Slowdown[] = [];
  const boardingWaits: BoardingWait[] = [];
  const observed = new Map<string, number>();
  for (const effect of effects) {
    if (effect.kind === "closure") closures.push(effect);
    else if (effect.kind === "slowdown") slowdowns.push(effect);
    else if (effect.kind === "boarding_wait") boardingWaits.push(effect);
    else observed.set(hopKey(effect.route_id, effect.from_stop_id, effect.to_stop_id), effect.minutes);
  }
  return {
    closures: group(closures),
    slowdowns: group(slowdowns),
    boardingWaits: group(boardingWaits),
    observed,
  };
}

export interface EdgeCost {
  minutes: number;
  /** Events that changed this edge's cost. */
  event_ids: string[];
}

function targetOf(edge: Edge): EffectTarget {
  return edge.kind === "ride" ? edge.mode : "walk";
}

function closureAt(c: CompiledConditions, stopId: string, target: EffectTarget) {
  return c.closures.get(stopId)?.find((closure) => closure.targets.includes(target));
}

/**
 * Cost of traversing an edge under current conditions; null when a verified
 * closure at either endpoint makes it unusable for the edge's mode.
 */
export function edgeCost(edge: Edge, c: CompiledConditions): EdgeCost | null {
  const target = targetOf(edge);
  if (closureAt(c, edge.from, target) || closureAt(c, edge.to, target)) return null;

  const routeId = edge.kind === "ride" ? edge.route_id : null;
  let minutes =
    edge.kind === "ride"
      ? c.observed.get(hopKey(edge.route_id, edge.from, edge.to)) ?? edge.minutes
      : edge.minutes;
  const eventIds: string[] = [];

  for (const stopId of new Set([edge.from, edge.to])) {
    for (const slowdown of c.slowdowns.get(stopId) ?? []) {
      if (!slowdown.targets.includes(target)) continue;
      if (slowdown.route_id !== null && slowdown.route_id !== routeId) continue;
      if (slowdown.scope === "departing" && stopId !== edge.from) continue;
      minutes = minutes * slowdown.factor + slowdown.added_mins;
      eventIds.push(slowdown.event_id);
    }
  }
  return { minutes, event_ids: eventIds };
}

/** Extra wait for boarding `edge`'s route at its first stop (e.g. full vehicles). */
export function boardingPenalty(edge: RideEdge, c: CompiledConditions): EdgeCost {
  let minutes = 0;
  const eventIds: string[] = [];
  for (const wait of c.boardingWaits.get(edge.from) ?? []) {
    if (wait.route_id !== edge.route_id) continue;
    minutes += wait.added_mins;
    eventIds.push(wait.event_id);
  }
  return { minutes, event_ids: eventIds };
}

/** Event ids whose closure blocks an edge, for explaining reroutes. */
export function blockingEvents(edge: Edge, c: CompiledConditions): string[] {
  const target = targetOf(edge);
  return [edge.from, edge.to]
    .map((stopId) => closureAt(c, stopId, target)?.event_id)
    .filter((id): id is string => id !== undefined);
}
