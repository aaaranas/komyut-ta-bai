import { jeepneyRoutes as cityJeepneyRoutes } from "@/data/generated/jeepney-routes";
import { jeepneyStops as cityJeepneyStops } from "@/data/generated/jeepney-stops";
import { myBusGeometry } from "@/data/generated/mybus-geometry";
import { jeepneyRoutes, jeepneyStops } from "@/data/jeepneys";
import { myBusRoutes } from "@/data/mybus-routes";
import { myBusStops } from "@/data/mybus-stops";
import { curatedRoutes } from "@/data/routes";
import { curatedStops } from "@/data/stops";
import { transfers } from "@/data/transfers";
import type { RouteRecord, StopRecord, TransferRecord } from "@/data/schema";

/**
 * The full curated dataset: hand-verified provincial corridors, MyBus, the
 * verified jeepney/e-jeepney routes (which share stop ids at common
 * landmarks), and the generated, unverified Cebu City jeepney network
 * (ids namespaced under "cj-").
 */
export const stopRecords: StopRecord[] = [
  ...curatedStops,
  ...myBusStops,
  ...jeepneyStops,
  ...cityJeepneyStops,
];

export const routeRecords: RouteRecord[] = [
  ...curatedRoutes,
  ...myBusRoutes,
  ...jeepneyRoutes,
  ...cityJeepneyRoutes,
];

export const transferRecords: TransferRecord[] = transfers;

/** Road-following polylines by route id (only MyBus has them so far). */
export const routeGeometry: Record<string, [number, number][]> = myBusGeometry;
