import { REPUTATION_HALF_LIFE_DAYS } from "@/core/sensing/policy";
import type { Report, ReportLabel, Reputation } from "@/core/sensing/types";

/**
 * Beta reputation (Jøsang & Ismail, 2002): with r positive and s negative
 * outcomes, expected reliability is (r + 1) / (r + s + 2). A contributor
 * with no history scores 0.5 — not assumed unreliable.
 */
export function betaReputation(positive: number, negative: number): number {
  return (positive + 1) / (positive + negative + 2);
}

export const NEW_CONTRIBUTOR: Reputation = { score: 0.5, positive: 0, negative: 0 };

/**
 * Reputation is updated only by independently justified labels (field
 * observation, official record, or a controlled scenario). Lack of
 * corroboration is not evidence of a false report, and agreement among
 * contributors is used for event confidence, never for reputation, so the
 * scoring does not become circular. Older labels count less (forgetting).
 */
export function buildReputations(
  reports: readonly Report[],
  labels: readonly ReportLabel[],
  now: Date
): Map<string, Reputation> {
  const contributorOf = new Map(reports.map((report) => [report.id, report.contributor]));
  const tallies = new Map<string, { positive: number; negative: number }>();

  for (const label of labels) {
    if (label.label === "unknown") continue;
    const contributor = contributorOf.get(label.report_id);
    if (!contributor) continue;
    const ageDays = (now.getTime() - new Date(label.labeled_at).getTime()) / 86_400_000;
    const weight = 0.5 ** (Math.max(0, ageDays) / REPUTATION_HALF_LIFE_DAYS);
    const tally = tallies.get(contributor) ?? { positive: 0, negative: 0 };
    if (label.label === "true") tally.positive += weight;
    else tally.negative += weight;
    tallies.set(contributor, tally);
  }

  const reputations = new Map<string, Reputation>();
  for (const [contributor, { positive, negative }] of tallies) {
    reputations.set(contributor, {
      score: betaReputation(positive, negative),
      positive,
      negative,
    });
  }
  return reputations;
}
