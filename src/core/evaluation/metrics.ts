import type { Report, ReportLabel, TransitEvent } from "@/core/sensing/types";

/**
 * Objective 4(c): precision and recall of the verification layer against
 * independently labeled reports. A report counts as admitted when the event
 * it belongs to was ever published.
 */
export interface VerificationMetrics {
  labeled: number;
  true_positive: number;
  /** False admissions: published although labeled false. */
  false_positive: number;
  /** False rejections: never published although labeled true. */
  false_negative: number;
  true_negative: number;
  precision: number | null;
  recall: number | null;
}

export function verificationMetrics(
  reports: readonly Report[],
  labels: readonly ReportLabel[],
  events: readonly TransitEvent[]
): VerificationMetrics {
  const admitted = new Set(
    events.filter((event) => event.published_at !== null).flatMap((event) => event.evidence_ids)
  );
  const labelOf = new Map(labels.map((label) => [label.report_id, label.label]));
  const counts = { tp: 0, fp: 0, fn: 0, tn: 0 };
  for (const report of reports) {
    if (report.kind === "clearance" || report.withdrawn_at !== null) continue;
    const label = labelOf.get(report.id);
    if (label !== "true" && label !== "false") continue;
    const positive = admitted.has(report.id);
    if (label === "true") counts[positive ? "tp" : "fn"]++;
    else counts[positive ? "fp" : "tn"]++;
  }
  const ratio = (num: number, den: number) => (den === 0 ? null : num / den);
  return {
    labeled: counts.tp + counts.fp + counts.fn + counts.tn,
    true_positive: counts.tp,
    false_positive: counts.fp,
    false_negative: counts.fn,
    true_negative: counts.tn,
    precision: ratio(counts.tp, counts.tp + counts.fp),
    recall: ratio(counts.tp, counts.tp + counts.fn),
  };
}

/**
 * Objective 4(b): interval between the first report of an event reaching the
 * server and the event being published into route recommendations. Clients
 * refresh conditions every minute, which bounds the remaining delay.
 */
export interface PropagationStats {
  events: number;
  median_mins: number | null;
  p90_mins: number | null;
  max_mins: number | null;
  samples: { event_id: string; minutes: number }[];
}

function quantile(sorted: number[], q: number): number | null {
  if (sorted.length === 0) return null;
  const index = Math.min(sorted.length - 1, Math.ceil(q * sorted.length) - 1);
  return sorted[Math.max(0, index)];
}

export function propagationStats(events: readonly TransitEvent[]): PropagationStats {
  const samples = events
    .filter((event) => event.published_at !== null)
    .map((event) => ({
      event_id: event.id,
      minutes:
        (new Date(event.published_at!).getTime() - new Date(event.first_submitted_at).getTime()) /
        60_000,
    }));
  const sorted = samples.map((s) => s.minutes).sort((a, b) => a - b);
  return {
    events: samples.length,
    median_mins: quantile(sorted, 0.5),
    p90_mins: quantile(sorted, 0.9),
    max_mins: sorted.at(-1) ?? null,
    samples,
  };
}

/** Objective 4(a): a field validation ride compared with both estimates. */
export interface FieldValidation {
  id: string;
  origin_id: string;
  destination_id: string;
  /** Local departure time, "YYYY-MM-DDTHH:MM". */
  depart_at: string;
  condition: "baseline" | "disruption";
  observed_mins: number;
  baseline_mins: number | null;
  enriched_mins: number | null;
  recorded_at: string;
  note?: string;
}

export interface AccuracyStats {
  condition: FieldValidation["condition"] | "all";
  rides: number;
  baseline_mae: number | null;
  enriched_mae: number | null;
  baseline_mape: number | null;
  enriched_mape: number | null;
}

function errors(validations: readonly FieldValidation[], pick: (v: FieldValidation) => number | null) {
  const pairs = validations
    .map((v) => ({ estimate: pick(v), observed: v.observed_mins }))
    .filter((p): p is { estimate: number; observed: number } => p.estimate !== null);
  if (pairs.length === 0) return { mae: null, mape: null };
  const mae = pairs.reduce((sum, p) => sum + Math.abs(p.estimate - p.observed), 0) / pairs.length;
  const mape =
    pairs.reduce((sum, p) => sum + Math.abs(p.estimate - p.observed) / p.observed, 0) / pairs.length;
  return { mae, mape };
}

export function estimateAccuracy(validations: readonly FieldValidation[]): AccuracyStats[] {
  const groups: [AccuracyStats["condition"], FieldValidation[]][] = [
    ["baseline", validations.filter((v) => v.condition === "baseline")],
    ["disruption", validations.filter((v) => v.condition === "disruption")],
    ["all", [...validations]],
  ];
  return groups.map(([condition, group]) => {
    const baseline = errors(group, (v) => v.baseline_mins);
    const enriched = errors(group, (v) => v.enriched_mins);
    return {
      condition,
      rides: group.length,
      baseline_mae: baseline.mae,
      enriched_mae: enriched.mae,
      baseline_mape: baseline.mape,
      enriched_mape: enriched.mape,
    };
  });
}
