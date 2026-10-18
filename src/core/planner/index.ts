import { network } from "@/core/transit/catalog";
import { buildGraph, edgesFrom, type TransitGraph } from "@/core/planner/graph";
import { planOnGraph, retimeOnGraph } from "@/core/planner/search";
import type { Itinerary, PlanOutcome, PlanRequest, RetimeOutcome } from "@/core/planner/types";

export { compileConditions, NO_CONDITIONS } from "@/core/planner/conditions";
export type { CompiledConditions, ConditionEffect, EffectTarget } from "@/core/planner/conditions";
export { endOf } from "@/core/planner/search";
export type * from "@/core/planner/types";

let defaultGraph: TransitGraph | null = null;

/** The graph over the curated dataset, built on first use. */
export function getGraph(): TransitGraph {
  defaultGraph ??= buildGraph(network);
  return defaultGraph;
}

export function planJourney(request: PlanRequest, graph = getGraph()): PlanOutcome {
  return planOnGraph(graph, request);
}

export function retimeItinerary(
  itinerary: Itinerary,
  request: PlanRequest,
  graph = getGraph()
): RetimeOutcome {
  return retimeOnGraph(graph, itinerary, request);
}

/** Baseline in-vehicle minutes for one hop of a route, if the hop exists. */
export function hopMinutes(routeId: string, from: string, to: string, graph = getGraph()): number | undefined {
  const edge = edgesFrom(graph, from).find(
    (candidate) => candidate.kind === "ride" && candidate.route_id === routeId && candidate.to === to
  );
  return edge?.minutes;
}
