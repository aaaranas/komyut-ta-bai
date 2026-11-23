import { cluster } from "@/core/sensing/events";
import type { Evidence, TransitEvent } from "@/core/sensing/types";

/** Report ids admitted by the confidence rule: their event was ever published. */
export function confidenceAdmitted(events: readonly TransitEvent[]): Set<string> {
  return new Set(events.filter((event) => event.published_at !== null).flatMap((event) => event.evidence_ids));
}

/**
 * The comparison rule for Objective 4(c): publish once `minAgreeing` distinct
 * sources report the same condition (same category, stop, and service,
 * within the category's match window), ignoring reputation, decay, and
 * location. It clusters evidence exactly like the confidence rule, so only
 * the decision differs.
 */
export function countOnlyAdmitted(evidence: readonly Evidence[], now: Date, minAgreeing = 2): Set<string> {
  const visible = evidence.filter((item) => new Date(item.submitted_at).getTime() <= now.getTime());
  const admitted = new Set<string>();
  for (const items of cluster(visible)) {
    const sources = new Set(items.filter((item) => item.kind !== "clearance").map((item) => item.source_key));
    if (sources.size >= minAgreeing) for (const item of items) admitted.add(item.id);
  }
  return admitted;
}
