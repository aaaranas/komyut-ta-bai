import type { LatLng } from "@/core/transit/geo";
import type { Route, Stop } from "@/core/transit/types";

/** Metro Cebu: 7 cities and 6 municipalities (the study area). */
export const METRO_CEBU_LGUS = [
  { name: "Carcar City", kind: "city" },
  { name: "Cebu City", kind: "city" },
  { name: "Danao City", kind: "city" },
  { name: "Lapu-Lapu City", kind: "city" },
  { name: "Mandaue City", kind: "city" },
  { name: "City of Naga", kind: "city" },
  { name: "Talisay City", kind: "city" },
  { name: "Compostela", kind: "municipality" },
  { name: "Consolacion", kind: "municipality" },
  { name: "Cordova", kind: "municipality" },
  { name: "Liloan", kind: "municipality" },
  { name: "Minglanilla", kind: "municipality" },
  { name: "San Fernando", kind: "municipality" },
] as const;

/**
 * Approximate box around the 13 LGUs (Carcar and San Fernando in the
 * south-west, Danao and Compostela in the north, Lapu-Lapu and Cordova in the
 * east). Used only when a stop's municipality label doesn't name an LGU.
 */
export const METRO_CEBU_BBOX = { minLat: 10.05, maxLat: 10.62, minLng: 123.58, maxLng: 124.08 } as const;

/** Normalizes "City of Naga", "Naga City", "naga" → "naga". */
export function lguKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/^city of\s+/, "")
    .replace(/\s+city$/, "")
    .trim();
}

const LGU_KEYS = new Set(METRO_CEBU_LGUS.map((lgu) => lguKey(lgu.name)));

function inBox({ lat, lng }: LatLng): boolean {
  const b = METRO_CEBU_BBOX;
  return lat >= b.minLat && lat <= b.maxLat && lng >= b.minLng && lng <= b.maxLng;
}

/**
 * A stop is in Metro Cebu when its municipality names one of the 13 LGUs; a
 * stop labeled with a municipality outside Metro Cebu is out of scope.
 */
export function inMetroCebu(stop: Pick<Stop, "municipality" | "lat" | "lng">): boolean {
  const label = stop.municipality.trim().toLowerCase();
  // A bare "Cebu" may mean the province, so it is placed by coordinates.
  if (label === "" || label === "cebu") return inBox(stop);
  return LGU_KEYS.has(lguKey(stop.municipality));
}

export type RouteScope = "metro" | "partial" | "out";

/**
 * "metro": every stop is in Metro Cebu. "partial": a road route that starts
 * or ends in Metro Cebu — only its Metro Cebu stops and segments are routed.
 * "out": no Metro Cebu stop, no Metro Cebu end, or a ferry leaving the area
 * (ferries are scheduled departures with no live sensing, and a ferry with
 * one Metro Cebu port has no Metro Cebu segment to route).
 */
export function routeScope(route: Route, isInScope: (stopId: string) => boolean): RouteScope {
  const flags = route.stop_ids.map(isInScope);
  if (flags.every(Boolean)) return "metro";
  if (route.mode === "ferry") return "out";
  const endsInMetro = flags[0] || flags[flags.length - 1];
  const metroHops = flags.slice(1).some((flag, i) => flag && flags[i]);
  return endsInMetro && metroHops ? "partial" : "out";
}
