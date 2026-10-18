import {
  blockingEvents,
  boardingPenalty,
  edgeCost,
  NO_CONDITIONS,
  type CompiledConditions,
} from "@/core/planner/conditions";
import { edgesFrom, type Edge, type RideEdge, type TransitGraph, type WalkEdge } from "@/core/planner/graph";
import { MinHeap } from "@/core/planner/heap";
import type {
  Itinerary,
  Leg,
  PlanOutcome,
  PlanRequest,
  RetimeOutcome,
} from "@/core/planner/types";
import { discountedFareForDistance, fareForDistance } from "@/core/transit/fare";
import { nextBoarding } from "@/core/transit/service";

/** Generated walking links may add at most this much walking per trip. */
export const MAX_PROXIMITY_WALK_MINS = 20;
/**
 * Search-only minutes added per transfer so the planner prefers staying on
 * one vehicle over hopping between overlapping routes to save a minute.
 * Reported times never include it.
 */
export const TRANSFER_FRICTION_MINS = 3;
/** Tie-breaker weight so equal primary costs prefer the better secondary. */
const SECONDARY_WEIGHT = 1e-3;

const START = "~start";
const ON_FOOT = "~walk";

/** Where a traveller is after traversing some edges. */
interface Cursor {
  stop: string;
  /** Boarded route id, or a sentinel when not on a vehicle. */
  mode: string;
  at: number;
  rideKm: number;
}

/** One traversed edge with everything needed to explain it afterwards. */
interface Step {
  edge: Edge;
  boards: boolean;
  /** Time the traveller reached `edge.from`. */
  arrived_at: number;
  wait: number;
  wait_estimated: boolean;
  minutes: number;
  fare_delta: number;
  event_ids: string[];
}

type Traversal =
  | { ok: true; step: Step; next: Cursor }
  | { ok: false; blocked_by: string[] };

/** Applies one edge to a cursor: boarding wait, conditions, and fare. */
function traverse(
  graph: TransitGraph,
  edge: Edge,
  cursor: Cursor,
  departDow: number,
  conditions: CompiledConditions
): Traversal {
  const cost = edgeCost(edge, conditions);
  if (!cost) return { ok: false, blocked_by: blockingEvents(edge, conditions) };

  if (edge.kind === "walk") {
    return {
      ok: true,
      step: {
        edge,
        boards: false,
        arrived_at: cursor.at,
        wait: 0,
        wait_estimated: false,
        minutes: cost.minutes,
        fare_delta: 0,
        event_ids: cost.event_ids,
      },
      next: { stop: edge.to, mode: ON_FOOT, at: cursor.at + cost.minutes, rideKm: 0 },
    };
  }

  const route = graph.routes.get(edge.route_id)!;
  const boards = cursor.mode !== edge.route_id;
  let wait = 0;
  let waitEstimated = false;
  const eventIds = [...cost.event_ids];
  if (boards) {
    const boarding = nextBoarding(route, edge.offset_mins, cursor.at, departDow);
    if (!boarding) return { ok: false, blocked_by: [] };
    const penalty = boardingPenalty(edge, conditions);
    wait = boarding.wait + penalty.minutes;
    waitEstimated = boarding.estimated;
    eventIds.push(...penalty.event_ids);
  }
  const priorKm = boards ? 0 : cursor.rideKm;
  const rideKm = priorKm + edge.km;
  const fareDelta =
    fareForDistance(route.fare, rideKm) - (boards ? 0 : fareForDistance(route.fare, priorKm));

  return {
    ok: true,
    step: {
      edge,
      boards,
      arrived_at: cursor.at,
      wait,
      wait_estimated: waitEstimated,
      minutes: cost.minutes,
      fare_delta: fareDelta,
      event_ids: eventIds,
    },
    next: { stop: edge.to, mode: edge.route_id, at: cursor.at + wait + cost.minutes, rideKm },
  };
}

interface Label extends Cursor {
  key: string;
  /** Last vehicle ridden; re-boarding it after a walk is not allowed. */
  lastRoute: string | null;
  fare: number;
  rides: number;
  proximityWalk: number;
  friction: number;
  cost: number;
  prev: Label | null;
  step: Step | null;
}

function labelKey(cursor: Cursor, rides: number, countRides: boolean): string {
  return countRides ? `${cursor.stop}|${cursor.mode}|${rides}` : `${cursor.stop}|${cursor.mode}`;
}

/**
 * Time-dependent Dijkstra over (stop, boarded-route) states. Labels carry
 * absolute time so waits follow each route's service windows; boarding a
 * vehicle is detected by a change of route, so fares are charged once per
 * vehicle. Feasibility rules are explicit: no two walking links in a row,
 * no walking off a vehicle only to re-board it, a cap on generated walking,
 * an optional ride limit, and (for "cheapest") an arrival bound relative to
 * the fastest trip.
 */
function search(
  graph: TransitGraph,
  request: PlanRequest,
  arrivalBound: number
): Label | null {
  const conditions = request.conditions ?? NO_CONDITIONS;
  const countRides = request.maxRides !== undefined;
  const departAt = request.depart.minutes;
  const priority = (at: number, fare: number, friction: number) =>
    request.preference === "cheapest"
      ? fare + (at - departAt) * SECONDARY_WEIGHT
      : at - departAt + friction + fare * SECONDARY_WEIGHT;

  const startCursor: Cursor = { stop: request.origin, mode: START, at: departAt, rideKm: 0 };
  const start: Label = {
    ...startCursor,
    key: labelKey(startCursor, 0, countRides),
    lastRoute: null,
    fare: 0,
    rides: 0,
    proximityWalk: 0,
    friction: 0,
    cost: 0,
    prev: null,
    step: null,
  };
  const best = new Map<string, Label>([[start.key, start]]);
  const settled = new Set<string>();
  const queue = new MinHeap<Label>();
  queue.push(start, 0);

  while (queue.size > 0) {
    const current = queue.pop()!;
    if (settled.has(current.key) || best.get(current.key) !== current) continue;
    settled.add(current.key);
    if (current.stop === request.destination) return current;

    for (const edge of edgesFrom(graph, current.stop)) {
      if (edge.kind === "walk" && current.mode === ON_FOOT) continue;
      if (edge.kind === "ride" && current.mode === ON_FOOT && edge.route_id === current.lastRoute) continue;
      const walkAdded = edge.kind === "walk" && edge.source === "proximity" ? edge.minutes : 0;
      if (current.proximityWalk + walkAdded > MAX_PROXIMITY_WALK_MINS) continue;

      const result = traverse(graph, edge, current, request.depart.dow, conditions);
      if (!result.ok) continue;
      const { step, next } = result;
      const rides = current.rides + (step.boards ? 1 : 0);
      if (request.maxRides !== undefined && rides > request.maxRides) continue;
      if (next.at > arrivalBound) continue;

      const fare = current.fare + step.fare_delta;
      const friction = current.friction + (step.boards && current.rides > 0 ? TRANSFER_FRICTION_MINS : 0);
      const label: Label = {
        ...next,
        key: labelKey(next, rides, countRides),
        lastRoute: edge.kind === "ride" ? edge.route_id : current.lastRoute,
        fare,
        rides,
        proximityWalk: current.proximityWalk + walkAdded,
        friction,
        cost: priority(next.at, fare, friction),
        prev: current,
        step,
      };
      const existing = best.get(label.key);
      if (settled.has(label.key) || (existing && existing.cost <= label.cost)) continue;
      best.set(label.key, label);
      queue.push(label, label.cost);
    }
  }
  return null;
}

function stepsOf(goal: Label): Step[] {
  const steps: Step[] = [];
  for (let label: Label | null = goal; label?.step; label = label.prev) {
    steps.unshift(label.step);
  }
  return steps;
}

/** Groups traversed edges into one leg per vehicle or walk. */
function assemble(graph: TransitGraph, steps: Step[], departAt: number): Itinerary {
  const legs: Leg[] = [];
  for (const step of steps) {
    const from = graph.stops.get(step.edge.from)!;
    const to = graph.stops.get(step.edge.to)!;
    const previous = legs[legs.length - 1];
    if (step.edge.kind === "walk") {
      legs.push({
        kind: "walk",
        from,
        to,
        start_at: step.arrived_at,
        end_at: step.arrived_at + step.minutes,
        minutes: step.minutes,
        source: step.edge.source,
        notes: step.edge.notes,
        event_ids: step.event_ids,
        hops: [step.edge as WalkEdge],
      });
      continue;
    }
    const edge = step.edge as RideEdge;
    if (!step.boards && previous?.kind === "ride" && previous.route.id === edge.route_id) {
      previous.to = to;
      previous.stop_ids.push(to.id);
      previous.alight_at += step.minutes;
      previous.ride_mins += step.minutes;
      previous.km += edge.km;
      previous.event_ids.push(...step.event_ids);
      previous.hops.push(edge);
      continue;
    }
    const boardAt = step.arrived_at + step.wait;
    legs.push({
      kind: "ride",
      route: graph.routes.get(edge.route_id)!,
      from,
      to,
      stop_ids: [from.id, to.id],
      arrive_stop_at: step.arrived_at,
      board_at: boardAt,
      alight_at: boardAt + step.minutes,
      wait_mins: step.wait,
      wait_estimated: step.wait_estimated,
      ride_mins: step.minutes,
      km: edge.km,
      fare: 0,
      discounted_fare: 0,
      event_ids: [...step.event_ids],
      hops: [edge],
    });
  }

  for (const leg of legs) {
    if (leg.kind !== "ride") continue;
    leg.fare = Math.round(fareForDistance(leg.route.fare, leg.km));
    leg.discounted_fare = Math.round(discountedFareForDistance(leg.route.fare, leg.km));
    leg.event_ids = [...new Set(leg.event_ids)];
  }

  const arriveAt = legs.length > 0 ? endOf(legs[legs.length - 1]) : departAt;
  const rides = legs.filter((leg) => leg.kind === "ride");
  const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);
  return {
    legs,
    depart_at: departAt,
    arrive_at: arriveAt,
    total_mins: arriveAt - departAt,
    waiting_mins: sum(rides.map((leg) => leg.wait_mins)),
    riding_mins: sum(rides.map((leg) => leg.ride_mins)),
    walking_mins: sum(legs.filter((leg) => leg.kind === "walk").map((leg) => leg.minutes)),
    fare: sum(rides.map((leg) => leg.fare)),
    discounted_fare: sum(rides.map((leg) => leg.discounted_fare)),
    rides: rides.length,
    event_ids: [...new Set(legs.flatMap((leg) => leg.event_ids))],
  };
}

export function endOf(leg: Leg): number {
  return leg.kind === "ride" ? leg.alight_at : leg.end_at;
}

export function planOnGraph(graph: TransitGraph, request: PlanRequest): PlanOutcome {
  if (!graph.stops.has(request.origin) || !graph.stops.has(request.destination)) {
    return { status: "unknown_stop" };
  }
  if (request.origin === request.destination) return { status: "same_stop" };

  const fastest = search(graph, { ...request, preference: "fastest" }, Infinity);
  if (!fastest) return { status: "no_route" };
  let goal = fastest;
  if (request.preference === "cheapest") {
    const fastestMins = fastest.at - request.depart.minutes;
    const bound = fastest.at + Math.max(60, fastestMins * 0.5);
    goal = search(graph, request, bound) ?? fastest;
  }
  return { status: "ok", itinerary: assemble(graph, stepsOf(goal), request.depart.minutes) };
}

/**
 * Re-times the same sequence of vehicles and walks under other conditions,
 * e.g. "your usual route under today's conditions". Boards wherever the
 * original itinerary boarded.
 */
export function retimeOnGraph(
  graph: TransitGraph,
  itinerary: Itinerary,
  request: PlanRequest
): RetimeOutcome {
  const conditions = request.conditions ?? NO_CONDITIONS;
  let cursor: Cursor = { stop: request.origin, mode: START, at: request.depart.minutes, rideKm: 0 };
  const steps: Step[] = [];
  for (const leg of itinerary.legs) {
    for (const [index, edge] of leg.hops.entries()) {
      // Every ride leg starts with a fresh boarding, as in the original.
      const from = index === 0 && edge.kind === "ride" ? { ...cursor, mode: START } : cursor;
      const result = traverse(graph, edge, from, request.depart.dow, conditions);
      if (!result.ok) return { status: "blocked", event_ids: result.blocked_by };
      steps.push(result.step);
      cursor = result.next;
    }
  }
  return { status: "ok", itinerary: assemble(graph, steps, request.depart.minutes) };
}
