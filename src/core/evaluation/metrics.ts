import { mcnemar, quantile, wilcoxonSignedRank, wilsonInterval, type Interval, type McNemarResult, type WilcoxonResult } from "@/core/evaluation/stats";
import type { EvalSplit, Report, ReportLabel, TransitEvent } from "@/core/sensing/types";

export type SplitFilter = EvalSplit | "all";

export const splitOf = (label: ReportLabel): EvalSplit => label.split ?? "dev";

/** A rate with its 95% Wilson interval. */
export interface Rate {
  value: number | null;
  ci: Interval | null;
}

const rate = (num: number, den: number): Rate => ({ value: den === 0 ? null : num / den, ci: wilsonInterval(num, den) });

/**
 * Objective 4(c): decisions of one rule against independently labeled
 * reports. A report is admitted when the rule published it.
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
  precision_rate: Rate;
  recall_rate: Rate;
  /** False admission rate, FP / (FP + TN). */
  false_admission: Rate;
  /** False rejection rate, FN / (FN + TP). */
  false_rejection: Rate;
}

/** Labeled, non-clearance, non-withdrawn reports in a split, with their truth. */
export function labeledReports(
  reports: readonly Report[],
  labels: readonly ReportLabel[],
  split: SplitFilter = "all"
): { report: Report; truth: boolean }[] {
  const labelOf = new Map(labels.map((label) => [label.report_id, label]));
  return reports.flatMap((report) => {
    if (report.kind === "clearance" || report.withdrawn_at !== null) return [];
    const label = labelOf.get(report.id);
    if (!label || (label.label !== "true" && label.label !== "false")) return [];
    if (split !== "all" && splitOf(label) !== split) return [];
    return [{ report, truth: label.label === "true" }];
  });
}

export function decisionMetrics(
  labeled: readonly { report: Report; truth: boolean }[],
  admitted: ReadonlySet<string>
): VerificationMetrics {
  const counts = { tp: 0, fp: 0, fn: 0, tn: 0 };
  for (const { report, truth } of labeled) {
    const positive = admitted.has(report.id);
    if (truth) counts[positive ? "tp" : "fn"]++;
    else counts[positive ? "fp" : "tn"]++;
  }
  const precision = rate(counts.tp, counts.tp + counts.fp);
  const recall = rate(counts.tp, counts.tp + counts.fn);
  return {
    labeled: labeled.length,
    true_positive: counts.tp,
    false_positive: counts.fp,
    false_negative: counts.fn,
    true_negative: counts.tn,
    precision: precision.value,
    recall: recall.value,
    precision_rate: precision,
    recall_rate: recall,
    false_admission: rate(counts.fp, counts.fp + counts.tn),
    false_rejection: rate(counts.fn, counts.fn + counts.tp),
  };
}

export function verificationMetrics(
  reports: readonly Report[],
  labels: readonly ReportLabel[],
  events: readonly TransitEvent[],
  split: SplitFilter = "all"
): VerificationMetrics {
  const admitted = new Set(events.filter((event) => event.published_at !== null).flatMap((event) => event.evidence_ids));
  return decisionMetrics(labeledReports(reports, labels, split), admitted);
}

export interface RuleComparison {
  split: SplitFilter;
  confidence: VerificationMetrics;
  count_only: VerificationMetrics;
  /** Reports the two rules decided differently. */
  disagreements: number;
  /** b: confidence rule right, count-only wrong; c: the reverse. */
  mcnemar: McNemarResult;
}

/** Both rules on the same labeled reports, compared with McNemar's test on their disagreements. */
export function compareRules(
  reports: readonly Report[],
  labels: readonly ReportLabel[],
  confidenceAdmitted: ReadonlySet<string>,
  countAdmitted: ReadonlySet<string>,
  split: SplitFilter = "all"
): RuleComparison {
  const labeled = labeledReports(reports, labels, split);
  let b = 0;
  let c = 0;
  for (const { report, truth } of labeled) {
    const a = confidenceAdmitted.has(report.id) === truth;
    const k = countAdmitted.has(report.id) === truth;
    if (a && !k) b++;
    else if (!a && k) c++;
  }
  return {
    split,
    confidence: decisionMetrics(labeled, confidenceAdmitted),
    count_only: decisionMetrics(labeled, countAdmitted),
    disagreements: b + c,
    mcnemar: mcnemar(b, c),
  };
}

/**
 * Objective 4(b): time from the earlier of report receipt or feed
 * observation (`source_at`) to the first route response that reflected the
 * event (the first /api/conditions snapshot carrying it), both server
 * timestamps. `decision_mins` is the server-side part: source to publication.
 */
export interface PropagationMark {
  event_id: string;
  source_at: string;
  first_route_response_at: string;
}

export interface PropagationSample {
  event_id: string;
  source_at: string;
  published_at: string;
  first_route_response_at: string | null;
  decision_mins: number;
  minutes: number | null;
  replay: boolean;
}

export interface PropagationStats {
  events: number;
  median_mins: number | null;
  p90_mins: number | null;
  max_mins: number | null;
  decision_median_mins: number | null;
  samples: PropagationSample[];
}

const minutesBetween = (from: string, to: string) => (new Date(to).getTime() - new Date(from).getTime()) / 60_000;

/** Replayed events are excluded from the statistics (their timestamps are scripted) but listed. */
export function propagationStats(events: readonly TransitEvent[], marks: readonly PropagationMark[] = []): PropagationStats {
  const markOf = new Map(marks.map((mark) => [mark.event_id, mark]));
  const samples: PropagationSample[] = events
    .filter((event) => event.published_at !== null)
    .map((event) => {
      const mark = markOf.get(event.id);
      return {
        event_id: event.id,
        source_at: event.first_submitted_at,
        published_at: event.published_at!,
        first_route_response_at: mark?.first_route_response_at ?? null,
        decision_mins: minutesBetween(event.first_submitted_at, event.published_at!),
        minutes: mark ? minutesBetween(mark.source_at, mark.first_route_response_at) : null,
        replay: event.replay,
      };
    });
  const real = samples.filter((sample) => !sample.replay);
  const sorted = real.flatMap((s) => (s.minutes === null ? [] : [s.minutes])).sort((a, b) => a - b);
  const decisions = real.map((s) => s.decision_mins).sort((a, b) => a - b);
  return {
    events: sorted.length,
    median_mins: quantile(sorted, 0.5),
    p90_mins: quantile(sorted, 0.9),
    max_mins: sorted.at(-1) ?? null,
    decision_median_mins: quantile(decisions, 0.5),
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
  /** Wilcoxon signed-rank test on paired absolute errors (baseline vs enriched). */
  wilcoxon: WilcoxonResult;
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
    const paired = group.filter((v) => v.baseline_mins !== null && v.enriched_mins !== null);
    return {
      condition,
      rides: group.length,
      wilcoxon: wilcoxonSignedRank(
        paired.map((v) => Math.abs(v.baseline_mins! - v.observed_mins)),
        paired.map((v) => Math.abs(v.enriched_mins! - v.observed_mins))
      ),
      baseline_mae: baseline.mae,
      enriched_mae: enriched.mae,
      baseline_mape: baseline.mape,
      enriched_mape: enriched.mape,
    };
  });
}
