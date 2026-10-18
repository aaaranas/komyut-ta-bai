import { hopMinutes } from "@/core/planner";
import { checkSegment } from "@/core/sensing/traces";
import type { SegmentObservation } from "@/core/sensing/types";
import { getRoute, getStop } from "@/core/transit/catalog";
import { HttpError, newId } from "@/server/http";
import { store } from "@/server/store";

const MAX_SEGMENTS = 200;
const MAX_AGE_MINS = 6 * 60;

interface SegmentInput {
  from_stop_id: string;
  to_stop_id: string;
  minutes: number;
  observed_at: string;
}

function isSegmentInput(value: unknown): value is SegmentInput {
  const s = value as Record<string, unknown>;
  return (
    typeof s === "object" &&
    s !== null &&
    typeof s.from_stop_id === "string" &&
    typeof s.to_stop_id === "string" &&
    typeof s.minutes === "number" &&
    typeof s.observed_at === "string"
  );
}

/**
 * Accepts stop-to-stop segments derived on the device from a consented
 * ride trace. The server re-checks each one (adjacent hop on this route,
 * plausible speed and duration, recent) before it counts toward any
 * aggregate; raw GPS fixes are never sent.
 */
export async function submitTrace(body: Record<string, unknown>, contributor: string) {
  if (body.consent !== true) throw new HttpError(400, "Ride tracing needs your explicit consent.");
  const route = typeof body.route_id === "string" ? getRoute(body.route_id) : undefined;
  if (!route) throw new HttpError(400, "Unknown route.");
  const raw = Array.isArray(body.segments) ? body.segments.slice(0, MAX_SEGMENTS) : [];
  const quality = (body.quality ?? {}) as Record<string, unknown>;
  const now = new Date();
  const traceId = newId("t");

  const accepted: SegmentObservation[] = [];
  const rejected: string[] = [];
  for (const item of raw) {
    if (!isSegmentInput(item)) {
      rejected.push("malformed segment");
      continue;
    }
    const from = getStop(item.from_stop_id);
    const to = getStop(item.to_stop_id);
    const baseline = hopMinutes(route.id, item.from_stop_id, item.to_stop_id);
    const ageMins = (now.getTime() - new Date(item.observed_at).getTime()) / 60_000;
    if (!from || !to || baseline === undefined) {
      rejected.push(`${item.from_stop_id} → ${item.to_stop_id}: not a hop on ${route.name}`);
      continue;
    }
    if (!(ageMins >= 0 && ageMins <= MAX_AGE_MINS)) {
      rejected.push(`${from.name} → ${to.name}: timestamp out of range`);
      continue;
    }
    const verdict = checkSegment(from, to, item.minutes, baseline);
    if (verdict) {
      rejected.push(`${from.name} → ${to.name}: ${verdict}`);
      continue;
    }
    accepted.push({
      id: newId("s"),
      route_id: route.id,
      from_stop_id: from.id,
      to_stop_id: to.id,
      minutes: item.minutes,
      observed_at: new Date(item.observed_at).toISOString(),
      contributor,
      trace_id: traceId,
      replay: null,
    });
  }

  await store.write((db) => {
    db.segments.push(...accepted);
    db.traces.push({
      id: traceId,
      contributor,
      route_id: route.id,
      submitted_at: now.toISOString(),
      points_total: typeof quality.points_total === "number" ? quality.points_total : 0,
      points_used: typeof quality.points_used === "number" ? quality.points_used : 0,
      accepted_segments: accepted.length,
      rejected_segments: rejected.length,
    });
  });
  return { trace_id: traceId, accepted: accepted.length, rejected };
}
