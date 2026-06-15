import { jeepneyRoutes } from "@/data/generated/jeepney-routes";
import { jeepneyStops } from "@/data/generated/jeepney-stops";
import { myBusGeometry } from "@/data/generated/mybus-geometry";
import { myBusInterchanges } from "@/data/mybus-interchanges";
import { myBusRoutes } from "@/data/mybus-routes";
import { myBusStops } from "@/data/mybus-stops";
import { curatedRoutes } from "@/data/routes";
import { curatedStops } from "@/data/stops";
import { transfers as curatedTransfers } from "@/data/transfers";
import { HUB_STOP_TYPES } from "@/lib/constants";
import type { Route, Stop, Transfer } from "@/lib/types";

/**
 * Single access point for the transit dataset: merges the hand-curated
 * corridors and MyBus with the generated (unverified) city-jeepney network
 * and provides indexed lookups so callers never build their own.
 */

export const stops: Stop[] = [...curatedStops, ...myBusStops, ...jeepneyStops];
export const routes: Route[] = [
  ...curatedRoutes,
  ...myBusRoutes,
  ...jeepneyRoutes,
];
export const transfers: Transfer[] = [
  ...curatedTransfers,
  ...myBusInterchanges,
];
export type { Route, Stop, Transfer };

const stopsById: ReadonlyMap<string, Stop> = new Map(
  stops.map((stop) => [stop.id, stop])
);
const routesById: ReadonlyMap<string, Route> = new Map(
  routes.map((route) => [route.id, route])
);

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
  return [...route.stops]
    .sort((a, b) => a.sequence - b.sequence)
    .map(({ stop_id }) => getStop(stop_id))
    .filter((stop): stop is Stop => stop !== undefined);
}

/** Road-following polyline for a route, if one was generated (MyBus only). */
export function getRouteGeometry(
  routeId: string
): [number, number][] | undefined {
  return myBusGeometry[routeId];
}

/** Notable interchange hubs (terminals and ports), terminals listed first. */
export function majorHubs(): Stop[] {
  return stops
    .filter((stop) => HUB_STOP_TYPES.includes(stop.type))
    .sort(
      (a, b) =>
        HUB_STOP_TYPES.indexOf(a.type) - HUB_STOP_TYPES.indexOf(b.type)
    );
}

/** Number of routes that call at a given stop. */
export function routeCountAt(stopId: string): number {
  return routes.filter((route) =>
    route.stops.some((routeStop) => routeStop.stop_id === stopId)
  ).length;
}
