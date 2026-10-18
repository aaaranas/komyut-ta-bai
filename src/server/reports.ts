import { CATEGORY_POLICY } from "@/core/sensing/policy";
import { NEW_CONTRIBUTOR } from "@/core/sensing/reputation";
import {
  REPORT_CATEGORIES,
  type EventStatus,
  type Report,
  type ReportCategory,
  type ReportDetails,
  type ReportKind,
} from "@/core/sensing/types";
import { getRoute, getStop } from "@/core/transit/catalog";
import { haversineKm } from "@/core/transit/geo";
import { HttpError, newId } from "@/server/http";
import { evaluateSensing } from "@/server/sensing";
import { store, type Database } from "@/server/store";

const KINDS: readonly ReportKind[] = ["observation", "confirmation", "clearance"];
const MAX_REPORT_AGE_MINS = 6 * 60;
/** Location fixes worse than this cannot say whether the reporter is on site. */
const MAX_USEFUL_ACCURACY_M = 1000;
const RATE_LIMIT = { reports: 10, window_mins: 10 };

const oneOf = <T extends string>(value: unknown, options: readonly T[]): value is T =>
  typeof value === "string" && (options as readonly string[]).includes(value);

const finite = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);

function parseDetails(category: ReportCategory, kind: ReportKind, raw: unknown): ReportDetails {
  if (kind === "clearance") return {};
  const details = (raw ?? {}) as Record<string, unknown>;
  switch (category) {
    case "delay": {
      const minutes = finite(details.delay_mins) ? Math.round(details.delay_mins) : 10;
      if (minutes < 1 || minutes > 180) throw new HttpError(400, "Delay must be 1–180 minutes.");
      return { delay_mins: minutes };
    }
    case "flooding":
      if (!oneOf(details.flood_level, ["passable", "impassable"] as const)) {
        throw new HttpError(400, "Say whether vehicles can still pass.");
      }
      return { flood_level: details.flood_level };
    case "road_disruption":
      if (!oneOf(details.road_status, ["slow", "closed"] as const)) {
        throw new HttpError(400, "Say whether the road is slow or closed.");
      }
      return { road_status: details.road_status };
    case "full_vehicle":
      return {};
  }
}

/**
 * Reduces a shared location to the distance from the reported stop (10 m
 * steps). Coordinates are discarded here and never stored.
 */
function distanceToStop(raw: unknown, stop: { lat: number; lng: number }): number | null {
  if (!raw || typeof raw !== "object") return null;
  const { lat, lng, accuracy_m } = raw as Record<string, unknown>;
  if (!finite(lat) || !finite(lng)) return null;
  if (finite(accuracy_m) && accuracy_m > MAX_USEFUL_ACCURACY_M) return null;
  return Math.round((haversineKm({ lat, lng }, stop) * 1000) / 10) * 10;
}

export function parseReport(body: Record<string, unknown>, contributor: string, now: Date): Report {
  if (!oneOf(body.category, REPORT_CATEGORIES)) throw new HttpError(400, "Unknown report category.");
  const category = body.category;
  const kind = body.kind === undefined ? "observation" : body.kind;
  if (!oneOf(kind, KINDS)) throw new HttpError(400, "Unknown report kind.");

  const stop = typeof body.stop_id === "string" ? getStop(body.stop_id) : undefined;
  if (!stop) throw new HttpError(400, "Pick the stop where this is happening.");

  const routeId = typeof body.route_id === "string" && body.route_id !== "" ? body.route_id : null;
  if (routeId) {
    const route = getRoute(routeId);
    if (!route || !route.stop_ids.includes(stop.id)) {
      throw new HttpError(400, "That ride does not stop there.");
    }
  } else if (CATEGORY_POLICY[category].requires_route) {
    throw new HttpError(400, "Pick which ride this is about.");
  }

  const minutesAgo = finite(body.observed_minutes_ago) ? body.observed_minutes_ago : 0;
  if (minutesAgo < 0 || minutesAgo > MAX_REPORT_AGE_MINS) {
    throw new HttpError(400, "Reports must describe the last six hours.");
  }

  return {
    id: newId("r"),
    category,
    kind,
    stop_id: stop.id,
    route_id: CATEGORY_POLICY[category].requires_route ? routeId : null,
    details: parseDetails(category, kind, body.details),
    contributor,
    observed_at: new Date(now.getTime() - minutesAgo * 60_000).toISOString(),
    submitted_at: now.toISOString(),
    distance_to_stop_m: distanceToStop(body.location, stop),
    withdrawn_at: null,
    replay: null,
  };
}

export interface ReportReceipt {
  report: Report;
  event_status: EventStatus | "withdrawn";
  event_id: string | null;
  confidence: number | null;
}

function receiptFor(db: Readonly<Database>, report: Report, now: Date): ReportReceipt {
  if (report.withdrawn_at) {
    return { report, event_status: "withdrawn", event_id: null, confidence: null };
  }
  const event = evaluateSensing(db, now).events.find((e) => e.evidence_ids.includes(report.id));
  return {
    report,
    event_status: event?.status ?? "pending",
    event_id: event?.id ?? null,
    confidence: event?.confidence ?? null,
  };
}

export async function submitReport(body: Record<string, unknown>, contributor: string): Promise<ReportReceipt> {
  const now = new Date();
  const report = parseReport(body, contributor, now);
  return store.write((db) => {
    const since = now.getTime() - RATE_LIMIT.window_mins * 60_000;
    const recent = db.reports.filter(
      (r) => r.contributor === contributor && new Date(r.submitted_at).getTime() >= since
    );
    if (recent.length >= RATE_LIMIT.reports) {
      throw new HttpError(429, "Too many reports in a short time. Please wait a few minutes.");
    }
    db.reports.push(report);
    return receiptFor(db, report, now);
  });
}

export async function withdrawReport(reportId: string, contributor: string): Promise<ReportReceipt> {
  const now = new Date();
  return store.write((db) => {
    const report = db.reports.find((r) => r.id === reportId);
    if (!report || report.contributor !== contributor) throw new HttpError(404, "Report not found.");
    report.withdrawn_at ??= now.toISOString();
    return receiptFor(db, report, now);
  });
}

export async function contributorSummary(contributor: string) {
  const now = new Date();
  return store.read((db) => {
    const { reputations, events } = evaluateSensing(db, now);
    const mine = db.reports
      .filter((report) => report.contributor === contributor)
      .sort((a, b) => b.submitted_at.localeCompare(a.submitted_at));
    const statusOf = (report: Report): ReportReceipt => {
      if (report.withdrawn_at) {
        return { report, event_status: "withdrawn", event_id: null, confidence: null };
      }
      const event = events.find((e) => e.evidence_ids.includes(report.id));
      return {
        report,
        event_status: event?.status ?? "expired",
        event_id: event?.id ?? null,
        confidence: event?.confidence ?? null,
      };
    };
    return {
      contributor,
      reputation: reputations.get(contributor) ?? NEW_CONTRIBUTOR,
      reports: mine.map(statusOf),
      ride_segments: db.segments.filter((s) => s.contributor === contributor).length,
    };
  });
}

/** Retention control: erases every report, label, and trace tied to a pseudonym. */
export async function eraseContributor(contributor: string) {
  return store.write((db) => {
    const removed = new Set(db.reports.filter((r) => r.contributor === contributor).map((r) => r.id));
    const before = { reports: removed.size, segments: db.segments.filter((s) => s.contributor === contributor).length };
    db.reports = db.reports.filter((r) => !removed.has(r.id));
    db.labels = db.labels.filter((label) => !removed.has(label.report_id));
    db.segments = db.segments.filter((s) => s.contributor !== contributor);
    db.traces = db.traces.filter((t) => t.contributor !== contributor);
    return { erased_reports: before.reports, erased_segments: before.segments };
  });
}
