/**
 * Data integrity checks for the curated transit dataset (Objective 1).
 * Run with: npm run validate. Exits non-zero if any check fails.
 */
import { CEBU_BOUNDS, isWithinCebu } from "../src/core/transit/geo";
import { normalizeNetwork } from "../src/core/transit/normalize";
import { parseClock } from "../src/core/transit/time";
import type { Network } from "../src/core/transit/types";
import { routeRecords, stopRecords, transferRecords } from "../src/data";
import type { RouteRecord, StopRecord, TransferRecord } from "../src/data/schema";

const CLOCK = /^([01]\d|2[0-3]):[0-5]\d$/;

function duplicates(ids: string[], kind: string): string[] {
  const seen = new Set<string>();
  return ids.flatMap((id) => {
    if (seen.has(id)) return [`Duplicate ${kind} id: ${id}`];
    seen.add(id);
    return [];
  });
}

function checkStops(stops: StopRecord[]): string[] {
  return stops
    .filter((stop) => !isWithinCebu(stop))
    .map(
      (stop) =>
        `Stop "${stop.id}" at (${stop.lat}, ${stop.lng}) is outside Cebu ` +
        `(${CEBU_BOUNDS.minLat}–${CEBU_BOUNDS.maxLat}°N, ${CEBU_BOUNDS.minLng}–${CEBU_BOUNDS.maxLng}°E)`
    );
}

function checkRoute(route: RouteRecord, stopIds: Set<string>): string[] {
  const errors: string[] = [];
  const where = `Route "${route.id}"`;
  if (route.stops.length < 2) errors.push(`${where} has fewer than 2 stops`);
  const sequences = new Set<number>();
  for (const { stop_id, sequence } of route.stops) {
    if (!stopIds.has(stop_id)) errors.push(`${where} references unknown stop "${stop_id}"`);
    if (sequences.has(sequence)) errors.push(`${where} has duplicate sequence ${sequence}`);
    sequences.add(sequence);
  }
  if (route.fare.base_fare < 0) errors.push(`${where} has a negative base fare`);
  if ("per_km" in route.fare && route.fare.per_km < 0) errors.push(`${where} has a negative per-km fare`);
  if (route.duration_mins <= 0) errors.push(`${where} has a non-positive duration`);
  if (route.frequency_mins <= 0) errors.push(`${where} has a non-positive headway`);
  for (const clock of [route.first_trip, route.last_trip]) {
    if (!CLOCK.test(clock)) errors.push(`${where} has malformed time "${clock}"`);
  }
  for (const window of route.schedule ?? []) {
    for (const clock of [window.first_trip, window.last_trip]) {
      if (!CLOCK.test(clock)) errors.push(`${where} schedule has malformed time "${clock}"`);
    }
  }
  for (const set of route.departures ?? []) {
    for (const clock of set.times) {
      if (!CLOCK.test(clock)) errors.push(`${where} has malformed departure "${clock}"`);
    }
  }
  if (route.unverified && !route.source_url?.startsWith("https://")) {
    errors.push(`Unverified ${where} has no source URL`);
  }
  return errors;
}

function checkTransfers(transfers: TransferRecord[], stopIds: Set<string>): string[] {
  return transfers.flatMap((transfer) => [
    ...[transfer.from_stop_id, transfer.to_stop_id]
      .filter((id) => !stopIds.has(id))
      .map((id) => `Transfer references unknown stop "${id}"`),
    ...(transfer.walk_minutes < 0
      ? [`Transfer ${transfer.from_stop_id} → ${transfer.to_stop_id} has negative time`]
      : []),
  ]);
}

/** Normalized service windows must have positive headways and sane hours. */
function checkNormalized(network: Network): string[] {
  return network.routes.flatMap((route) => {
    if (route.service.kind !== "frequency") return [];
    return route.service.windows.flatMap((window) => {
      const errors: string[] = [];
      if (!(window.headway_mins > 0)) errors.push(`Route "${route.id}" has a window without a headway`);
      if (parseClock(window.start) === parseClock(window.end)) {
        errors.push(`Route "${route.id}" has a zero-length service window`);
      }
      return errors;
    });
  });
}

function main(): void {
  const stopIds = new Set(stopRecords.map((stop) => stop.id));
  const errors = [
    ...duplicates(stopRecords.map((s) => s.id), "stop"),
    ...duplicates(routeRecords.map((r) => r.id), "route"),
    ...checkStops(stopRecords),
    ...routeRecords.flatMap((route) => checkRoute(route, stopIds)),
    ...checkTransfers(transferRecords, stopIds),
  ];
  const network = normalizeNetwork(stopRecords, routeRecords, transferRecords);
  errors.push(...checkNormalized(network));

  if (errors.length > 0) {
    console.error(`✗ Data validation failed with ${errors.length} error(s):`);
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
  }

  const proximity = network.transfers.filter((t) => t.source === "proximity").length;
  const oneWay = network.routes.filter((r) => r.direction === "one_way").length;
  const estimates = network.routes.filter((r) => r.service.evidence === "estimate").length;
  console.log(
    `✓ Data valid: ${network.stops.length} stops, ${network.routes.length} routes ` +
      `(${oneWay} one-way, ${estimates} with estimated headways), ` +
      `${transferRecords.length} curated transfers + ${proximity} generated walking links`
  );
}

main();
