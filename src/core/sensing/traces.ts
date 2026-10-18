import { TRAVEL_TIME_POLICY } from "@/core/sensing/policy";
import type { SegmentObservation, TravelTimeAggregate } from "@/core/sensing/types";
import { haversineKm } from "@/core/transit/geo";
import type { Route, Stop } from "@/core/transit/types";

/** One GPS fix. Raw fixes stay on the device; only derived segments are sent. */
export interface TracePoint {
  t: number;
  lat: number;
  lng: number;
  accuracy_m: number;
}

export interface DerivedSegment {
  from_stop_id: string;
  to_stop_id: string;
  minutes: number;
  observed_at: string;
}

export interface TraceQuality {
  points_total: number;
  points_used: number;
  stops_passed: number;
  rejected: string[];
}

interface Passage {
  index: number;
  t: number;
}

/** Times the trace passed each stop: the closest fix of each visit within the radius. */
function passages(order: Stop[], points: TracePoint[]): Passage[] {
  const radiusKm = TRAVEL_TIME_POLICY.stop_radius_m / 1000;
  const found: Passage[] = [];
  order.forEach((stop, index) => {
    let visit: { t: number; km: number } | null = null;
    for (const point of points) {
      const km = haversineKm(point, stop);
      if (km <= radiusKm) {
        if (!visit || km < visit.km) visit = { t: point.t, km };
      } else if (visit) {
        found.push({ index, t: visit.t });
        visit = null;
      }
    }
    if (visit) found.push({ index, t: visit.t });
  });
  return found.sort((a, b) => a.t - b.t);
}

/**
 * Source-appropriate checks for GPS observations: fixes must be accurate,
 * consecutive stop passages must be adjacent on the route (in a direction the
 * route actually runs), and implied speed and duration must be plausible.
 */
export function deriveSegments(
  route: Route,
  order: Stop[],
  points: readonly TracePoint[],
  baselineMinutes: (from: string, to: string) => number | undefined
): { segments: DerivedSegment[]; quality: TraceQuality } {
  const usable = points
    .filter((point) => point.accuracy_m <= TRAVEL_TIME_POLICY.max_accuracy_m)
    .sort((a, b) => a.t - b.t);
  const passed = passages(order, usable);
  const segments: DerivedSegment[] = [];
  const rejected: string[] = [];

  for (let i = 0; i < passed.length - 1; i++) {
    const a = passed[i];
    const b = passed[i + 1];
    const step = b.index - a.index;
    if (step !== 1 && !(step === -1 && route.direction === "both_ways")) continue;
    const from = order[a.index];
    const to = order[b.index];
    const verdict = checkSegment(from, to, (b.t - a.t) / 60_000, baselineMinutes(from.id, to.id));
    if (verdict) {
      rejected.push(`${from.name} → ${to.name}: ${verdict}`);
      continue;
    }
    segments.push({
      from_stop_id: from.id,
      to_stop_id: to.id,
      minutes: (b.t - a.t) / 60_000,
      observed_at: new Date(b.t).toISOString(),
    });
  }

  return {
    segments,
    quality: {
      points_total: points.length,
      points_used: usable.length,
      stops_passed: new Set(passed.map((p) => p.index)).size,
      rejected,
    },
  };
}

/** Returns a rejection reason, or null when the segment is plausible. */
export function checkSegment(
  from: Stop,
  to: Stop,
  minutes: number,
  baseline: number | undefined
): string | null {
  if (!(minutes > 0)) return "non-positive duration";
  const speed = haversineKm(from, to) / (minutes / 60);
  if (speed > TRAVEL_TIME_POLICY.max_speed_kmh) return `implausible speed (${Math.round(speed)} km/h)`;
  if (baseline !== undefined && minutes > baseline * TRAVEL_TIME_POLICY.max_baseline_ratio + 5) {
    return "far slower than any plausible ride (likely a stop or detour)";
  }
  return null;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Aggregated travel-time output: recent segment observations reduced to a
 * per-hop median. Only aggregates are ever published, never single traces.
 */
export function aggregateTravelTimes(
  observations: readonly SegmentObservation[],
  now: Date
): TravelTimeAggregate[] {
  const since = now.getTime() - TRAVEL_TIME_POLICY.window_mins * 60_000;
  const groups = new Map<string, SegmentObservation[]>();
  for (const observation of observations) {
    const at = new Date(observation.observed_at).getTime();
    if (at < since || at > now.getTime()) continue;
    const key = `${observation.route_id}|${observation.from_stop_id}|${observation.to_stop_id}`;
    groups.set(key, [...(groups.get(key) ?? []), observation]);
  }
  return [...groups.values()].map((group) => ({
    route_id: group[0].route_id,
    from_stop_id: group[0].from_stop_id,
    to_stop_id: group[0].to_stop_id,
    median_mins: median(group.map((o) => o.minutes)),
    samples: group.length,
    contributors: new Set(group.map((o) => o.contributor)).size,
    latest_at: group.map((o) => o.observed_at).sort().at(-1)!,
  }));
}
