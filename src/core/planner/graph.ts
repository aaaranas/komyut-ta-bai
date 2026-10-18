import { haversineKm } from "@/core/transit/geo";
import type { Mode, Network, Route, Stop, Transfer } from "@/core/transit/types";

/** One hop of a vehicle between consecutive stops, in one direction. */
export interface RideEdge {
  kind: "ride";
  from: string;
  to: string;
  route_id: string;
  mode: Mode;
  /** Baseline in-vehicle minutes for the hop. */
  minutes: number;
  km: number;
  /** In-vehicle minutes from the route's origin to `from`, for this direction. */
  offset_mins: number;
}

/** A walking (or curated cross-town) link between two stops. */
export interface WalkEdge {
  kind: "walk";
  from: string;
  to: string;
  minutes: number;
  source: Transfer["source"];
  notes?: string;
}

export type Edge = RideEdge | WalkEdge;

export interface TransitGraph {
  stops: ReadonlyMap<string, Stop>;
  routes: ReadonlyMap<string, Route>;
  adjacency: ReadonlyMap<string, Edge[]>;
}

function pushEdge(adjacency: Map<string, Edge[]>, edge: Edge): void {
  const list = adjacency.get(edge.from);
  if (list) list.push(edge);
  else adjacency.set(edge.from, [edge]);
}

/**
 * Adds directed hops along `order`, distributing the route's duration
 * across hops in proportion to great-circle distance.
 */
function addRideEdges(
  adjacency: Map<string, Edge[]>,
  route: Route,
  order: Stop[]
): void {
  const hopKm = order.slice(1).map((stop, i) => haversineKm(order[i], stop));
  const totalKm = hopKm.reduce((sum, km) => sum + km, 0);
  let offset = 0;
  hopKm.forEach((km, i) => {
    const minutes =
      totalKm > 0
        ? (route.duration_mins * km) / totalKm
        : route.duration_mins / hopKm.length;
    pushEdge(adjacency, {
      kind: "ride",
      from: order[i].id,
      to: order[i + 1].id,
      route_id: route.id,
      mode: route.mode,
      minutes,
      km,
      offset_mins: offset,
    });
    offset += minutes;
  });
}

/**
 * Directed multigraph: vertices are stops, parallel edges distinguish the
 * routes joining the same pair, and direction follows each route's
 * `direction` (one-way records are never reversed).
 */
export function buildGraph(network: Network): TransitGraph {
  const stops = new Map(network.stops.map((stop) => [stop.id, stop]));
  const routes = new Map(network.routes.map((route) => [route.id, route]));
  const adjacency = new Map<string, Edge[]>();

  for (const route of network.routes) {
    const order = route.stop_ids
      .map((id) => stops.get(id))
      .filter((stop): stop is Stop => stop !== undefined);
    if (order.length < 2) continue;
    addRideEdges(adjacency, route, order);
    if (route.direction === "both_ways") {
      addRideEdges(adjacency, route, [...order].reverse());
    }
  }

  for (const transfer of network.transfers) {
    const base = {
      kind: "walk" as const,
      minutes: transfer.minutes,
      source: transfer.source,
      notes: transfer.notes,
    };
    pushEdge(adjacency, { ...base, from: transfer.from_stop_id, to: transfer.to_stop_id });
    pushEdge(adjacency, { ...base, from: transfer.to_stop_id, to: transfer.from_stop_id });
  }

  return { stops, routes, adjacency };
}

export function edgesFrom(graph: TransitGraph, stopId: string): Edge[] {
  return graph.adjacency.get(stopId) ?? [];
}
