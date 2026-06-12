import { getStop, routes, transfers } from "@/lib/catalog";
import type { Mode, Route, Transfer } from "@/lib/types";
import { haversineKm } from "@/lib/utils/geo";

export interface Edge {
  to: string;
  /** Travel time in minutes (walk_minutes for transfers). */
  minutes: number;
  /** Distance-based fare for this hop; boarding fees are added by the planner. */
  fare: number;
  mode: Mode | "transfer";
  /** Null for transfer edges. */
  route_id: string | null;
}

type AdjacencyMap = Map<string, Edge[]>;

function addEdge(adjacency: AdjacencyMap, from: string, edge: Edge): void {
  const edges = adjacency.get(from);
  if (edges) edges.push(edge);
  else adjacency.set(from, [edge]);
}

function hopDistancesKm(route: Route): number[] {
  const ordered = [...route.stops].sort((a, b) => a.sequence - b.sequence);
  const distances: number[] = [];
  for (let i = 0; i < ordered.length - 1; i++) {
    const from = getStop(ordered[i].stop_id);
    const to = getStop(ordered[i + 1].stop_id);
    if (!from || !to) throw new Error(`Unknown stop in route ${route.id}`);
    distances.push(haversineKm(from.lat, from.lng, to.lat, to.lng));
  }
  return distances;
}

/**
 * Adds bidirectional edges for each consecutive stop pair, distributing the
 * route's total duration across hops proportionally to great-circle distance.
 */
function addRouteEdges(adjacency: AdjacencyMap, route: Route): void {
  const ordered = [...route.stops].sort((a, b) => a.sequence - b.sequence);
  const hopKm = hopDistancesKm(route);
  const totalKm = hopKm.reduce((sum, km) => sum + km, 0);

  for (let i = 0; i < hopKm.length; i++) {
    const minutes =
      totalKm > 0
        ? (route.duration_mins * hopKm[i]) / totalKm
        : route.duration_mins / hopKm.length;
    const fare = "per_km" in route.fare ? route.fare.per_km * hopKm[i] : 0;
    const edge = { minutes, fare, mode: route.mode, route_id: route.id };
    addEdge(adjacency, ordered[i].stop_id, { ...edge, to: ordered[i + 1].stop_id });
    addEdge(adjacency, ordered[i + 1].stop_id, { ...edge, to: ordered[i].stop_id });
  }
}

function addTransferEdges(adjacency: AdjacencyMap, transfer: Transfer): void {
  const edge = {
    minutes: transfer.walk_minutes,
    fare: 0,
    mode: "transfer" as const,
    route_id: null,
  };
  addEdge(adjacency, transfer.from_stop_id, { ...edge, to: transfer.to_stop_id });
  addEdge(adjacency, transfer.to_stop_id, { ...edge, to: transfer.from_stop_id });
}

function buildGraph(): ReadonlyMap<string, Edge[]> {
  const adjacency: AdjacencyMap = new Map();
  for (const route of routes) addRouteEdges(adjacency, route);
  for (const transfer of transfers) addTransferEdges(adjacency, transfer);
  return adjacency;
}

export const graph: ReadonlyMap<string, Edge[]> = buildGraph();

export function edgesFrom(stopId: string): Edge[] {
  return graph.get(stopId) ?? [];
}
