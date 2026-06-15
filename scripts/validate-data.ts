/**
 * Data integrity checks for the transit dataset (curated + generated).
 * Run with: npm run validate. Exits non-zero if any check fails.
 */
import { routes, stops, transfers } from "../src/lib/catalog";
import { CEBU_BOUNDS } from "../src/lib/constants";
import type { Route, Stop, Transfer } from "../src/lib/types";
import { isWithinCebu } from "../src/lib/utils/geo";

function checkDuplicateStopIds(allStops: Stop[]): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const stop of allStops) {
    if (seen.has(stop.id)) errors.push(`Duplicate stop id: ${stop.id}`);
    seen.add(stop.id);
  }
  return errors;
}

function checkDuplicateRouteIds(allRoutes: Route[]): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const route of allRoutes) {
    if (seen.has(route.id)) errors.push(`Duplicate route id: ${route.id}`);
    seen.add(route.id);
  }
  return errors;
}

function checkStopsWithinCebu(allStops: Stop[]): string[] {
  const errors: string[] = [];
  for (const stop of allStops) {
    if (!isWithinCebu(stop.lat, stop.lng)) {
      errors.push(
        `Stop "${stop.id}" at (${stop.lat}, ${stop.lng}) is outside Cebu ` +
          `(${CEBU_BOUNDS.minLat}–${CEBU_BOUNDS.maxLat}°N, ` +
          `${CEBU_BOUNDS.minLng}–${CEBU_BOUNDS.maxLng}°E)`
      );
    }
  }
  return errors;
}

function checkRouteShape(route: Route, stopIds: Set<string>): string[] {
  const errors: string[] = [];
  if (route.stops.length < 2) {
    errors.push(`Route "${route.id}" has fewer than 2 stops`);
  }
  const seenSequences = new Set<number>();
  for (const { stop_id, sequence } of route.stops) {
    if (!stopIds.has(stop_id)) {
      errors.push(`Route "${route.id}" references unknown stop "${stop_id}"`);
    }
    if (seenSequences.has(sequence)) {
      errors.push(`Route "${route.id}" has duplicate sequence ${sequence}`);
    }
    seenSequences.add(sequence);
  }
  return errors;
}

function checkRouteFares(route: Route): string[] {
  const errors: string[] = [];
  if (route.fare.base_fare < 0) {
    errors.push(`Route "${route.id}" has a negative base fare`);
  }
  if ("per_km" in route.fare && route.fare.per_km < 0) {
    errors.push(`Route "${route.id}" has a negative per-km fare`);
  }
  if (route.unverified && !route.source_url?.startsWith("https://")) {
    errors.push(`Unverified route "${route.id}" has no source URL`);
  }
  return errors;
}

function checkTransfers(
  allTransfers: Transfer[],
  stopIds: Set<string>
): string[] {
  const errors: string[] = [];
  for (const transfer of allTransfers) {
    for (const stopId of [transfer.from_stop_id, transfer.to_stop_id]) {
      if (!stopIds.has(stopId)) {
        errors.push(`Transfer references unknown stop "${stopId}"`);
      }
    }
    if (transfer.walk_minutes < 0) {
      errors.push(
        `Transfer ${transfer.from_stop_id} → ${transfer.to_stop_id} has negative walk time`
      );
    }
  }
  return errors;
}

function main(): void {
  const stopIds = new Set(stops.map((stop) => stop.id));
  const errors = [
    ...checkDuplicateStopIds(stops),
    ...checkDuplicateRouteIds(routes),
    ...checkStopsWithinCebu(stops),
    ...routes.flatMap((route) => [
      ...checkRouteShape(route, stopIds),
      ...checkRouteFares(route),
    ]),
    ...checkTransfers(transfers, stopIds),
  ];

  if (errors.length > 0) {
    console.error(`✗ Data validation failed with ${errors.length} error(s):`);
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
  }

  console.log(
    `✓ Data valid: ${stops.length} stops, ${routes.length} routes, ` +
      `${transfers.length} transfers`
  );
}

main();
