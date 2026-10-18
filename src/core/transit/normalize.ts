import type {
  DepartureRecord,
  FareRecord,
  RouteRecord,
  ServiceWindowRecord,
  StopRecord,
  TransferRecord,
} from "@/data/schema";
import { haversineKm } from "@/core/transit/geo";
import type {
  DayType,
  Fare,
  Mode,
  Network,
  Route,
  Service,
  Stop,
  Transfer,
} from "@/core/transit/types";

const ALL_DAYS: DayType[] = ["weekday", "saturday", "sunday"];

/**
 * LTFRB PUJ fare matrices charge a minimum fare for the first 4 km and a
 * per-km rate after that. Other modes default to per-km from the start.
 */
const DEFAULT_BASE_KM: Partial<Record<Mode, number>> = {
  jeepney: 4,
  mjeepney: 4,
};

/** Generated walking links connect stops of different routes up to this far apart. */
export const PROXIMITY_RADIUS_KM = 0.25;
/** Street walking is longer than the straight line between two stops. */
const WALK_DETOUR_FACTOR = 1.3;
const WALK_SPEED_KMH = 4.5;

export function parseDays(label: string): DayType[] {
  const text = label.toLowerCase();
  if (text.includes("daily") || text.includes("every day")) return ALL_DAYS;
  const days = new Set<DayType>();
  if (text.includes("weekday") || text.includes("mon")) days.add("weekday");
  if (text.includes("weekend") || text.includes("sat")) days.add("saturday");
  if (text.includes("weekend") || text.includes("sun")) days.add("sunday");
  return days.size > 0 ? [...days] : ALL_DAYS;
}

/** "every 5–20 min" → 12.5; "every 30 min" → 30; otherwise the fallback. */
export function parseHeadway(label: string, fallback: number): number {
  const numbers = (label.match(/\d+(\.\d+)?/g) ?? []).map(Number);
  if (numbers.length >= 2) return (numbers[0] + numbers[1]) / 2;
  if (numbers.length === 1) return numbers[0];
  return fallback;
}

function normalizeFare(record: FareRecord, mode: Mode): Fare {
  if ("flat" in record) {
    return {
      kind: "flat",
      amount: record.base_fare,
      discounted_amount: record.discounted_fare,
    };
  }
  return {
    kind: "distance",
    base_fare: record.base_fare,
    base_km: record.base_km ?? DEFAULT_BASE_KM[mode] ?? 0,
    per_km: record.per_km,
  };
}

function windowsFrom(
  schedule: ServiceWindowRecord[],
  fallbackHeadway: number
) {
  return schedule.map((window) => ({
    days: parseDays(window.days),
    start: window.first_trip,
    end: window.last_trip,
    headway_mins: parseHeadway(window.frequency, fallbackHeadway),
    headway_label: window.frequency,
  }));
}

function departuresFrom(departures: DepartureRecord[]) {
  return departures.map((set) => ({
    days: parseDays(set.days),
    times: [...set.times].sort(),
  }));
}

function normalizeService(record: RouteRecord): Service {
  const evidence =
    record.headway_evidence ?? (record.unverified ? "estimate" : "published");
  if (record.departures && record.departures.length > 0) {
    return { kind: "scheduled", departures: departuresFrom(record.departures), evidence };
  }
  const windows = record.schedule
    ? windowsFrom(record.schedule, record.frequency_mins)
    : [
        {
          days: ALL_DAYS,
          start: record.first_trip,
          end: record.last_trip,
          headway_mins: record.frequency_mins,
          headway_label: `every ${record.frequency_mins} min`,
        },
      ];
  return { kind: "frequency", windows, evidence };
}

export function normalizeRoute(record: RouteRecord): Route {
  return {
    id: record.id,
    name: record.name,
    mode: record.mode,
    operator: record.operator,
    stop_ids: [...record.stops]
      .sort((a, b) => a.sequence - b.sequence)
      .map((stop) => stop.stop_id),
    fare: normalizeFare(record.fare, record.mode),
    duration_mins: record.duration_mins,
    direction: record.direction ?? "both_ways",
    service: normalizeService(record),
    provenance: {
      status: record.unverified ? "unverified" : "verified",
      date: record.verified_date,
      source_url: record.source_url,
    },
    notes: record.notes,
  };
}

export function walkingMinutes(km: number): number {
  return Math.max(1, Math.ceil(((km * WALK_DETOUR_FACTOR) / WALK_SPEED_KMH) * 60));
}

/**
 * Walking links between nearby stops served by different routes, so the
 * separately-sourced networks (provincial, MyBus, jeepney) connect where
 * their stops sit side by side. Pairs already linked by a curated transfer
 * are skipped; curated notes are more useful than a generated estimate.
 */
export function proximityTransfers(
  stops: Stop[],
  routes: Route[],
  curated: Transfer[]
): Transfer[] {
  const routesAt = new Map<string, Set<string>>();
  for (const route of routes) {
    for (const stopId of route.stop_ids) {
      const set = routesAt.get(stopId) ?? new Set<string>();
      set.add(route.id);
      routesAt.set(stopId, set);
    }
  }
  const linked = new Set(
    curated.flatMap((t) => [
      `${t.from_stop_id}|${t.to_stop_id}`,
      `${t.to_stop_id}|${t.from_stop_id}`,
    ])
  );
  const sameRoutes = (a: string, b: string) => {
    const left = routesAt.get(a) ?? new Set();
    const right = routesAt.get(b) ?? new Set();
    return left.size === right.size && [...left].every((id) => right.has(id));
  };

  const served = stops.filter((stop) => routesAt.has(stop.id));
  const links: Transfer[] = [];
  for (let i = 0; i < served.length; i++) {
    for (let j = i + 1; j < served.length; j++) {
      const a = served[i];
      const b = served[j];
      // Cheap latitude prefilter: 0.0025° ≈ 280 m.
      if (Math.abs(a.lat - b.lat) > 0.0025) continue;
      const km = haversineKm(a, b);
      if (km > PROXIMITY_RADIUS_KM) continue;
      if (linked.has(`${a.id}|${b.id}`) || sameRoutes(a.id, b.id)) continue;
      links.push({
        from_stop_id: a.id,
        to_stop_id: b.id,
        minutes: walkingMinutes(km),
        source: "proximity",
      });
    }
  }
  return links;
}

export function normalizeNetwork(
  stopRecords: StopRecord[],
  routeRecords: RouteRecord[],
  transferRecords: TransferRecord[]
): Network {
  const stops: Stop[] = stopRecords.map((record) => ({ ...record }));
  const routes = routeRecords.map(normalizeRoute);
  const curated: Transfer[] = transferRecords.map((record) => ({
    from_stop_id: record.from_stop_id,
    to_stop_id: record.to_stop_id,
    minutes: record.walk_minutes,
    source: "curated",
    notes: record.notes,
  }));
  return {
    stops,
    routes,
    transfers: [...curated, ...proximityTransfers(stops, routes, curated)],
  };
}
