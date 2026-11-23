import { routeGeometry, routeRecords, stopRecords, transferRecords } from "@/data";
import { normalizeNetwork } from "@/core/transit/normalize";
import { inMetroCebu, routeScope, type RouteScope } from "@/core/transit/scope";
import type { Network, Route, Stop, StopType } from "@/core/transit/types";

/**
 * Single access point for the curated dataset, normalized once at import
 * time, with indexed lookups so callers never build their own.
 */
export const network: Network = normalizeNetwork(
  stopRecords,
  routeRecords,
  transferRecords
);

export const { stops, routes, transfers } = network;

const stopsById: ReadonlyMap<string, Stop> = new Map(
  stops.map((stop) => [stop.id, stop])
);
const routesById: ReadonlyMap<string, Route> = new Map(
  routes.map((route) => [route.id, route])
);
const routesByStop: ReadonlyMap<string, Route[]> = (() => {
  const index = new Map<string, Route[]>();
  for (const route of routes) {
    for (const stopId of new Set(route.stop_ids)) {
      index.set(stopId, [...(index.get(stopId) ?? []), route]);
    }
  }
  return index;
})();

export function getStop(stopId: string): Stop | undefined {
  return stopsById.get(stopId);
}

export function getRoute(routeId: string): Route | undefined {
  return routesById.get(routeId);
}

export function hasStop(stopId: string): boolean {
  return stopsById.has(stopId);
}

/** A route's stops in travel order. */
export function orderedStopsOf(route: Route): Stop[] {
  return route.stop_ids
    .map((stopId) => stopsById.get(stopId))
    .filter((stop): stop is Stop => stop !== undefined);
}

/** Routes that call at a stop. */
export function routesAt(stopId: string): Route[] {
  return routesByStop.get(stopId) ?? [];
}

/** Road-following polyline for a route, if one was generated (MyBus only). */
export function getRouteGeometry(routeId: string): [number, number][] | undefined {
  return routeGeometry[routeId];
}

export const HUB_STOP_TYPES: StopType[] = ["terminal", "port"];

/** Notable interchange hubs (terminals and ports), terminals listed first. */
export function majorHubs(): Stop[] {
  return scopedStops
    .filter((stop) => HUB_STOP_TYPES.includes(stop.type))
    .sort((a, b) => HUB_STOP_TYPES.indexOf(a.type) - HUB_STOP_TYPES.indexOf(b.type));
}

const inScopeIds: ReadonlySet<string> = new Set(stops.filter(inMetroCebu).map((stop) => stop.id));
const scopeOfRoute: ReadonlyMap<string, RouteScope> = new Map(
  routes.map((route) => [route.id, routeScope(route, (id) => inScopeIds.has(id))])
);

/** Is this stop inside Metro Cebu (the study area the planner routes)? */
export function stopInScope(stopId: string): boolean {
  return inScopeIds.has(stopId);
}

/** Whether a route is fully, partly, or not routed in Metro Cebu. */
export function scopeOf(route: Route): RouteScope {
  return scopeOfRoute.get(route.id) ?? "out";
}

/** Stops the planner can route to and from. */
export const scopedStops: Stop[] = stops.filter((stop) => inScopeIds.has(stop.id));
