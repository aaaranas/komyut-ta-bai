import { getRoute, getStop, hasStop } from "@/lib/catalog";
import type { JourneyResult, Leg, Preference } from "@/lib/types";
import { boardingFare } from "@/lib/utils/fare";
import { edgesFrom, type Edge } from "@/lib/planner/graph";

/**
 * Dijkstra over (stop, boarded-route) states so boarding fees are charged
 * exactly once per vehicle, not per hop.
 */

interface SearchState {
  stop: string;
  /** Route currently boarded, null when on foot. */
  route: string | null;
}

interface Visit {
  state: SearchState;
  cost: number;
  minutes: number;
  fare: number;
  prev: string | null;
  via: Edge | null;
}

interface TraversedHop {
  fromStop: string;
  edge: Edge;
  boarded: boolean;
}

const stateKey = (state: SearchState) => `${state.stop}|${state.route ?? ""}`;

/** Tie-breaker so equally-priced paths prefer the quicker one (and vice versa). */
const SECONDARY_WEIGHT = 1e-4;

function edgeBoardingFee(edge: Edge, currentRoute: string | null): number {
  const boardsNewVehicle =
    edge.route_id !== null && edge.route_id !== currentRoute;
  if (!boardsNewVehicle) return 0;
  return boardingFare(getRoute(edge.route_id!)!);
}

function visitCost(
  minutes: number,
  fare: number,
  preference: Preference
): number {
  return preference === "cheapest"
    ? fare + minutes * SECONDARY_WEIGHT
    : minutes + fare * SECONDARY_WEIGHT;
}

/** Array-scan extract-min; the graph is small so a heap isn't warranted. */
function popCheapest(queue: Visit[]): Visit {
  let minIndex = 0;
  for (let i = 1; i < queue.length; i++) {
    if (queue[i].cost < queue[minIndex].cost) minIndex = i;
  }
  return queue.splice(minIndex, 1)[0];
}

function runSearch(
  originStopId: string,
  destinationStopId: string,
  preference: Preference
): { goal: Visit; best: Map<string, Visit> } | null {
  const start: Visit = {
    state: { stop: originStopId, route: null },
    cost: 0,
    minutes: 0,
    fare: 0,
    prev: null,
    via: null,
  };
  const best = new Map<string, Visit>([[stateKey(start.state), start]]);
  const queue: Visit[] = [start];

  while (queue.length > 0) {
    const current = popCheapest(queue);
    if (best.get(stateKey(current.state)) !== current) continue; // stale

    if (current.state.stop === destinationStopId) {
      return { goal: current, best };
    }

    for (const edge of edgesFrom(current.state.stop)) {
      const minutes = current.minutes + edge.minutes;
      const fare =
        current.fare + edge.fare + edgeBoardingFee(edge, current.state.route);
      const cost = visitCost(minutes, fare, preference);

      const nextState: SearchState = { stop: edge.to, route: edge.route_id };
      const nextKey = stateKey(nextState);
      const existing = best.get(nextKey);
      if (existing && existing.cost <= cost) continue;

      const visit: Visit = {
        state: nextState,
        cost,
        minutes,
        fare,
        prev: stateKey(current.state),
        via: edge,
      };
      best.set(nextKey, visit);
      queue.push(visit);
    }
  }
  return null;
}

/** Walks predecessors back to the origin, collecting traversed edges. */
function tracePath(goal: Visit, best: Map<string, Visit>): TraversedHop[] {
  const path: TraversedHop[] = [];
  for (let visit = goal; visit.prev !== null; visit = best.get(visit.prev)!) {
    const previous = best.get(visit.prev)!;
    const edge = visit.via!;
    path.unshift({
      fromStop: previous.state.stop,
      edge,
      boarded: edge.route_id !== null && edge.route_id !== previous.state.route,
    });
  }
  return path;
}

/** Merges consecutive hops on the same route into one leg per vehicle. */
function mergeHopsIntoLegs(path: TraversedHop[]): Leg[] {
  const legs: Leg[] = [];
  for (const { fromStop, edge, boarded } of path) {
    const previousLeg = legs[legs.length - 1];
    const hopFare =
      edge.fare + (boarded ? boardingFare(getRoute(edge.route_id!)!) : 0);
    const continuesSameVehicle =
      previousLeg !== undefined &&
      edge.route_id !== null &&
      previousLeg.route?.id === edge.route_id &&
      !boarded;

    if (continuesSameVehicle) {
      previousLeg.to_stop = getStop(edge.to)!;
      previousLeg.fare += hopFare;
      previousLeg.duration_mins += edge.minutes;
    } else {
      legs.push({
        from_stop: getStop(fromStop)!,
        to_stop: getStop(edge.to)!,
        route: edge.route_id ? getRoute(edge.route_id)! : null,
        mode: edge.mode,
        fare: hopFare,
        duration_mins: edge.minutes,
      });
    }
  }
  return legs;
}

function roundLegsForDisplay(legs: Leg[]): void {
  for (const leg of legs) {
    leg.fare = Math.round(leg.fare);
    leg.duration_mins = Math.round(leg.duration_mins);
  }
}

export function planJourney(
  originStopId: string,
  destinationStopId: string,
  preference: Preference
): JourneyResult | null {
  if (!hasStop(originStopId) || !hasStop(destinationStopId)) return null;
  if (originStopId === destinationStopId) {
    return { legs: [], total_fare: 0, total_duration_mins: 0 };
  }

  const search = runSearch(originStopId, destinationStopId, preference);
  if (!search) return null;

  const legs = mergeHopsIntoLegs(tracePath(search.goal, search.best));
  roundLegsForDisplay(legs);

  return {
    legs,
    total_fare: legs.reduce((sum, leg) => sum + leg.fare, 0),
    total_duration_mins: legs.reduce((sum, leg) => sum + leg.duration_mins, 0),
  };
}
