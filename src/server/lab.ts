import { estimateAccuracy, propagationStats, verificationMetrics, type FieldValidation } from "@/core/evaluation/metrics";
import { SCENARIOS, getScenario } from "@/core/evaluation/scenarios";
import type { HazardSourceId, OfficialKind, OfficialObservation } from "@/core/hazards/types";
import { compileConditions, planJourney } from "@/core/planner";
import type { EventStatus, LabelBasis, Report, ReportLabel, TruthLabel } from "@/core/sensing/types";
import { getStop } from "@/core/transit/catalog";
import { cebuDepartureTime, cebuInstant } from "@/core/transit/time";
import { HttpError, newId, pseudonymize } from "@/server/http";
import { buildSnapshot, evaluateSensing } from "@/server/sensing";
import { store } from "@/server/store";

const LABELS: readonly TruthLabel[] = ["true", "false", "unknown"];
const BASES: readonly LabelBasis[] = ["field_observation", "official_record", "controlled_scenario"];
const SOURCES: readonly HazardSourceId[] = ["pagasa", "dost_asti", "phivolcs"];
const OFFICIAL_KINDS: readonly OfficialKind[] = ["advisory", "sensor_reading", "hazard_context"];

const oneOf = <T extends string>(value: unknown, options: readonly T[]): value is T =>
  typeof value === "string" && (options as readonly string[]).includes(value);

/** Everything the research console shows, evaluated at `now`. */
export async function labOverview() {
  const now = new Date();
  const storage = await store.storageMode();
  return store.read((db) => {
    const { reputations, events } = evaluateSensing(db, now);
    const eventOf = new Map(events.flatMap((event) => event.evidence_ids.map((id) => [id, event] as const)));
    return {
      storage,
      now: now.toISOString(),
      scenarios: SCENARIOS,
      reports: [...db.reports]
        .sort((a, b) => b.submitted_at.localeCompare(a.submitted_at))
        .map((report) => ({
          ...report,
          credibility: reputations.get(report.contributor)?.score ?? 0.5,
          event_id: eventOf.get(report.id)?.id ?? null,
          event_status: (report.withdrawn_at ? "withdrawn" : eventOf.get(report.id)?.status ?? "expired") as
            | EventStatus
            | "withdrawn",
          label: db.labels.find((label) => label.report_id === report.id) ?? null,
        })),
      events,
      official: db.official,
      validations: db.validations,
      metrics: {
        verification: verificationMetrics(db.reports, db.labels, events),
        propagation: propagationStats(events),
        accuracy: estimateAccuracy(db.validations),
      },
      counts: {
        reports: db.reports.length,
        labels: db.labels.length,
        segments: db.segments.length,
        traces: db.traces.length,
      },
    };
  });
}

export async function loadScenario(scenarioId: string) {
  const scenario = getScenario(scenarioId);
  if (!scenario) throw new HttpError(404, "Unknown scenario.");
  const now = new Date();
  const at = (offset: number) => new Date(now.getTime() + offset * 60_000).toISOString();
  const replay = { scenario_id: scenario.id };
  const reports: Report[] = [];
  const labels: ReportLabel[] = [];
  const official: OfficialObservation[] = [];

  for (const step of scenario.steps) {
    if (step.type === "report") {
      const report: Report = {
        id: newId("r"),
        category: step.category,
        kind: step.kind,
        stop_id: step.stop_id,
        route_id: step.route_id,
        details: step.details,
        contributor: pseudonymize(`replay:${scenario.id}:${step.actor}`),
        observed_at: at(step.offset_mins),
        submitted_at: at(step.offset_mins),
        distance_to_stop_m: step.distance_to_stop_m,
        withdrawn_at: null,
        replay,
      };
      reports.push(report);
      labels.push({
        report_id: report.id,
        label: step.truth,
        basis: "controlled_scenario",
        labeled_at: now.toISOString(),
        note: `Scripted in scenario “${scenario.title}”.`,
      });
    } else {
      official.push({
        id: newId("o"),
        source: step.source,
        kind: step.kind,
        title: step.title,
        summary: step.summary,
        area: step.area,
        reading: step.reading,
        observed_at: at(step.offset_mins),
        valid_until: at(step.offset_mins + step.validity_mins),
        connection: "manual",
        replay,
      });
    }
  }

  await store.write((db) => {
    db.reports.push(...reports);
    db.labels.push(...labels);
    db.official.push(...official);
  });
  return { loaded: scenario.id, reports: reports.length, official: official.length };
}

/** Removes all replay data, leaving real contributions untouched. */
export async function clearReplays() {
  return store.write((db) => {
    const replayIds = new Set(db.reports.filter((r) => r.replay).map((r) => r.id));
    db.reports = db.reports.filter((r) => !replayIds.has(r.id));
    db.labels = db.labels.filter((label) => !replayIds.has(label.report_id));
    db.official = db.official.filter((o) => !o.replay);
    return { removed_reports: replayIds.size };
  });
}

export async function setLabel(body: Record<string, unknown>) {
  if (typeof body.report_id !== "string") throw new HttpError(400, "report_id is required.");
  if (!oneOf(body.label, LABELS)) throw new HttpError(400, "label must be true, false, or unknown.");
  if (!oneOf(body.basis, BASES)) throw new HttpError(400, "basis is required.");
  const label: ReportLabel = {
    report_id: body.report_id,
    label: body.label,
    basis: body.basis,
    labeled_at: new Date().toISOString(),
    note: typeof body.note === "string" ? body.note.slice(0, 500) : undefined,
  };
  return store.write((db) => {
    if (!db.reports.some((r) => r.id === label.report_id)) throw new HttpError(404, "Report not found.");
    db.labels = [...db.labels.filter((l) => l.report_id !== label.report_id), label];
    return label;
  });
}

/** A manually entered official record — always labeled "manual", never "live". */
export async function addOfficial(body: Record<string, unknown>) {
  if (!oneOf(body.source, SOURCES)) throw new HttpError(400, "Unknown source.");
  if (!oneOf(body.kind, OFFICIAL_KINDS)) throw new HttpError(400, "Unknown record kind.");
  const stop = typeof body.stop_id === "string" ? getStop(body.stop_id) : undefined;
  if (!stop) throw new HttpError(400, "Pick the stop nearest the record's area.");
  const radius = typeof body.radius_km === "number" ? Math.min(Math.max(body.radius_km, 0.1), 20) : 1;
  const validity = typeof body.validity_mins === "number" ? Math.min(Math.max(body.validity_mins, 5), 24 * 60) : 60;
  const value = Number(body.reading_value);
  const threshold = Number(body.reading_threshold);
  const now = new Date();
  const record: OfficialObservation = {
    id: newId("o"),
    source: body.source,
    kind: body.kind,
    title: typeof body.title === "string" && body.title.trim() ? body.title.trim().slice(0, 120) : "Manual record",
    summary: typeof body.summary === "string" ? body.summary.slice(0, 500) : "",
    area: { label: `${stop.name} area`, lat: stop.lat, lng: stop.lng, radius_km: radius },
    reading:
      body.kind === "sensor_reading" && Number.isFinite(value) && Number.isFinite(threshold)
        ? { metric: "water_level_m", value, threshold }
        : undefined,
    observed_at: now.toISOString(),
    valid_until: new Date(now.getTime() + validity * 60_000).toISOString(),
    connection: "manual",
    replay: null,
  };
  await store.write((db) => {
    db.official.push(record);
  });
  return record;
}

/**
 * Records a field validation ride and computes both estimates for the same
 * departure: the baseline (curated data only) and the enriched plan using
 * conditions as they stood at departure.
 */
export async function addValidation(body: Record<string, unknown>) {
  const origin = typeof body.origin_id === "string" ? getStop(body.origin_id) : undefined;
  const destination = typeof body.destination_id === "string" ? getStop(body.destination_id) : undefined;
  if (!origin || !destination) throw new HttpError(400, "Pick both stops.");
  const departValue = typeof body.depart_at === "string" ? body.depart_at : "";
  const departInstant = cebuInstant(departValue);
  if (!departInstant) throw new HttpError(400, "Departure must be YYYY-MM-DDTHH:MM (Cebu time).");
  const observed = Number(body.observed_mins);
  if (!(observed > 0 && observed < 24 * 60)) throw new HttpError(400, "Observed minutes must be positive.");
  const condition = body.condition === "disruption" ? "disruption" : "baseline";

  const storage = await store.storageMode();
  const snapshot = await store.read((db) => buildSnapshot(db, departInstant, storage));
  const request = {
    origin: origin.id,
    destination: destination.id,
    preference: "fastest" as const,
    depart: cebuDepartureTime(departInstant),
  };
  const baseline = planJourney(request);
  const enriched = planJourney({ ...request, conditions: compileConditions(snapshot.effects) });
  const validation: FieldValidation = {
    id: newId("v"),
    origin_id: origin.id,
    destination_id: destination.id,
    depart_at: departValue,
    condition,
    observed_mins: observed,
    baseline_mins: baseline.status === "ok" ? Math.round(baseline.itinerary.total_mins) : null,
    enriched_mins: enriched.status === "ok" ? Math.round(enriched.itinerary.total_mins) : null,
    recorded_at: new Date().toISOString(),
    note: typeof body.note === "string" ? body.note.slice(0, 500) : undefined,
  };
  await store.write((db) => {
    db.validations.push(validation);
  });
  return validation;
}
