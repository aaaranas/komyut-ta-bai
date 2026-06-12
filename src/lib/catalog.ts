import { jeepneyRoutes } from "@/data/generated/jeepney-routes";
import { jeepneyStops } from "@/data/generated/jeepney-stops";
import { curatedRoutes } from "@/data/routes";
import { curatedStops } from "@/data/stops";
import { transfers } from "@/data/transfers";
import type { Route, Stop, Transfer } from "@/lib/types";

/**
 * Single access point for the transit dataset: merges the hand-curated
 * corridors with the generated (unverified) city-jeepney network and
 * provides indexed lookups so callers never build their own.
 */

export const stops: Stop[] = [...curatedStops, ...jeepneyStops];
export const routes: Route[] = [...curatedRoutes, ...jeepneyRoutes];
export { transfers };
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
