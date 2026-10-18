import {
  BLOCKING_HOLD_MAX_MINS,
  CATEGORY_POLICY,
  KIND_WEIGHT,
  ON_SITE_RADIUS_M,
  SITE_FACTOR,
  THRESHOLDS,
} from "@/core/sensing/policy";
import { NEW_CONTRIBUTOR } from "@/core/sensing/reputation";
import type {
  Evidence,
  EventStatus,
  EvidenceWeight,
  Report,
  ReportCategory,
  ReportDetails,
  Reputation,
  TransitEvent,
} from "@/core/sensing/types";

const MINUTE = 60_000;

const time = (iso: string) => new Date(iso).getTime();

/** Noisy-OR: independent pieces of evidence combine without exceeding 1. */
export function combine(weights: readonly number[]): number {
  return 1 - weights.reduce((remaining, weight) => remaining * (1 - weight), 1);
}

/** Exponential time decay with a hard cut-off at the category's maximum age. */
export function decay(ageMins: number, halfLifeMins: number, maxAgeMins: number): number {
  if (ageMins < 0 || ageMins > maxAgeMins) return 0;
  return 0.5 ** (ageMins / halfLifeMins);
}

export function siteFactor(distanceToStopM: number | null): number {
  if (distanceToStopM === null) return SITE_FACTOR.unknown;
  return distanceToStopM <= ON_SITE_RADIUS_M ? SITE_FACTOR.on_site : SITE_FACTOR.far;
}

/** Commuter reports as scoring evidence, weighted by contributor reputation. */
export function reportEvidence(
  reports: readonly Report[],
  reputations: ReadonlyMap<string, Reputation>
): Evidence[] {
  return reports
    .filter((report) => report.withdrawn_at === null)
    .map((report) => ({
      id: report.id,
      source_key: report.contributor,
      origin: "commuter",
      kind: report.kind,
      category: report.category,
      stop_id: report.stop_id,
      route_id: report.route_id,
      details: report.details,
      observed_at: report.observed_at,
      submitted_at: report.submitted_at,
      credibility: (reputations.get(report.contributor) ?? NEW_CONTRIBUTOR).score,
      site_factor: siteFactor(report.distance_to_stop_m),
      replay: report.replay !== null,
    }));
}

/**
 * Reports are matched by category, location, and (for vehicle-specific
 * categories) service, then by time: evidence further apart than the
 * category's match window starts a new event. A delayed vehicle and a
 * normally moving one on the same corridor are not merged.
 */
function matchKey(evidence: Evidence): string {
  const policy = CATEGORY_POLICY[evidence.category];
  return `${evidence.category}|${evidence.stop_id}|${policy.requires_route ? evidence.route_id : "*"}`;
}

function cluster(evidence: readonly Evidence[]): Evidence[][] {
  const sorted = [...evidence].sort((a, b) => time(a.observed_at) - time(b.observed_at));
  const open = new Map<string, { items: Evidence[]; lastSupport: number }>();
  const clusters: Evidence[][] = [];
  for (const item of sorted) {
    const key = matchKey(item);
    const policy = CATEGORY_POLICY[item.category];
    const current = open.get(key);
    const observed = time(item.observed_at);
    if (item.kind === "clearance") {
      // A clearance only speaks to a condition that was already reported.
      if (current && observed - current.lastSupport <= BLOCKING_HOLD_MAX_MINS * MINUTE) {
        current.items.push(item);
      }
      continue;
    }
    if (current && observed - current.lastSupport <= policy.match_window_mins * MINUTE) {
      current.items.push(item);
      current.lastSupport = observed;
      continue;
    }
    const next = { items: [item], lastSupport: observed };
    open.set(key, next);
    clusters.push(next.items);
  }
  return clusters;
}

interface Score {
  support: number;
  counter: number;
  confidence: number;
  independent: number;
  official: number;
  confirmations: number;
  details: ReportDetails;
  blockingCandidate: boolean;
  blocking: boolean;
  weights: EvidenceWeight[];
  supportItems: Evidence[];
  hasClearance: boolean;
}

/**
 * Keeps one support item and one clearance per independent source (the most
 * recent of each), so repeat submissions from one pseudonym, or several
 * stations derived from one advisory, never count twice. A source's own
 * later clearance retracts its earlier observation.
 */
function dedupe(items: readonly Evidence[]): { support: Evidence[]; clearance: Evidence[] } {
  const latestSupport = new Map<string, Evidence>();
  const latestClearance = new Map<string, Evidence>();
  for (const item of items) {
    const target = item.kind === "clearance" ? latestClearance : latestSupport;
    const existing = target.get(item.source_key);
    if (!existing || time(item.observed_at) >= time(existing.observed_at)) {
      target.set(item.source_key, item);
    }
  }
  for (const [source, clearance] of latestClearance) {
    const support = latestSupport.get(source);
    if (!support) continue;
    if (time(clearance.observed_at) > time(support.observed_at)) latestSupport.delete(source);
    else latestClearance.delete(source);
  }
  return { support: [...latestSupport.values()], clearance: [...latestClearance.values()] };
}

function median(values: number[]): number | undefined {
  if (values.length === 0) return undefined;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** Severity agreed by the weighted majority of supporting evidence. */
function aggregateDetails(items: Evidence[], weightOf: (item: Evidence) => number): ReportDetails {
  const share = (predicate: (item: Evidence) => boolean) => {
    const total = items.reduce((sum, item) => sum + weightOf(item), 0);
    const matching = items.filter(predicate).reduce((sum, item) => sum + weightOf(item), 0);
    return total > 0 ? matching / total : 0;
  };
  const details: ReportDetails = {};
  const delays = items.map((item) => item.details.delay_mins).filter((m): m is number => m !== undefined);
  if (delays.length > 0) details.delay_mins = median(delays);
  if (items.some((item) => item.details.flood_level)) {
    details.flood_level = share((item) => item.details.flood_level === "impassable") >= 0.5 ? "impassable" : "passable";
  }
  if (items.some((item) => item.details.road_status)) {
    details.road_status = share((item) => item.details.road_status === "closed") >= 0.5 ? "closed" : "slow";
  }
  return details;
}

function score(items: readonly Evidence[], at: number): Score {
  const visible = items.filter(
    (item) => time(item.submitted_at) <= at && time(item.observed_at) <= at
  );
  const { support, clearance } = dedupe(visible);
  const weigh = (item: Evidence): EvidenceWeight => {
    const policy = CATEGORY_POLICY[item.category];
    const ageMins = (at - time(item.observed_at)) / MINUTE;
    const weight =
      item.credibility *
      KIND_WEIGHT[item.kind] *
      item.site_factor *
      decay(ageMins, policy.half_life_mins, policy.max_age_mins);
    return {
      evidence_id: item.id,
      origin: item.origin,
      kind: item.kind,
      age_mins: ageMins,
      weight,
      site_factor: item.site_factor,
      official_source: item.official?.source,
      official_connection: item.official?.connection,
    };
  };
  const supportWeights = support.map(weigh);
  const clearanceWeights = clearance.map(weigh);
  const weightById = new Map(supportWeights.map((w) => [w.evidence_id, w.weight]));
  const live = support.filter((item) => (weightById.get(item.id) ?? 0) > 0);

  const supportValue = combine(supportWeights.map((w) => w.weight));
  const counter = combine(clearanceWeights.map((w) => w.weight));
  const confidence = supportValue * (1 - counter);
  const details = aggregateDetails(live, (item) => weightById.get(item.id) ?? 0);
  const independent = live.length;
  const official = live.filter((item) => item.origin === "official").length;
  const category = items[0].category;
  const blockingCandidate =
    (category === "flooding" && details.flood_level === "impassable") ||
    (category === "road_disruption" && details.road_status === "closed");
  const blocking =
    blockingCandidate &&
    confidence >= THRESHOLDS.blocking &&
    independent >= THRESHOLDS.blocking_min_independent_sources;

  return {
    support: supportValue,
    counter,
    confidence,
    independent,
    official,
    confirmations: live.filter((item) => item.kind === "confirmation").length,
    details,
    blockingCandidate,
    blocking,
    weights: [...supportWeights, ...clearanceWeights],
    supportItems: support,
    hasClearance: clearanceWeights.some((w) => w.weight > 0),
  };
}

function tierOf(confidence: number): EventStatus {
  if (confidence >= THRESHOLDS.corroborated) return "corroborated";
  if (confidence >= THRESHOLDS.publish) return "uncertain";
  return "pending";
}

function isCleared(s: Score): boolean {
  return s.counter >= THRESHOLDS.clearance && s.counter > s.support;
}

/** First minute (stepping forward) when the event would drop below publication. */
function fadeTime(items: readonly Evidence[], from: number): number {
  const maxAge = CATEGORY_POLICY[items[0].category].max_age_mins;
  for (let step = 5; step <= maxAge + 5; step += 5) {
    const at = from + step * MINUTE;
    if (score(items, at).confidence < THRESHOLDS.publish) return at;
  }
  return from + maxAge * MINUTE;
}

/** A held event keeps the blocking severity it was confirmed with. */
function heldDetails(category: ReportCategory, details: ReportDetails): ReportDetails {
  return category === "flooding"
    ? { ...details, flood_level: "impassable" }
    : { ...details, road_status: "closed" };
}

function evaluateCluster(items: Evidence[], now: Date): TransitEvent {
  const nowMs = now.getTime();
  const category = items[0].category;
  const policy = CATEGORY_POLICY[category];
  const arrivals = [...new Set(items.map((item) => time(item.submitted_at)))]
    .filter((at) => at <= nowMs)
    .sort((a, b) => a - b);

  // Replay arrivals to find when the event was first published and whether
  // it ever met the bar for disabling a segment.
  let publishedAt: number | null = null;
  let peakBlockingConfidence = 0;
  for (const at of arrivals) {
    const s = score(items, at);
    if (publishedAt === null && !isCleared(s) && s.confidence >= THRESHOLDS.publish) publishedAt = at;
    if (s.blocking) peakBlockingConfidence = Math.max(peakBlockingConfidence, s.confidence);
  }

  const current = score(items, nowMs);
  const support = current.supportItems;
  const lastSupport = Math.max(...support.map((item) => time(item.observed_at)), 0);
  const held =
    policy.clearance_required &&
    peakBlockingConfidence > 0 &&
    !current.blocking &&
    !current.hasClearance &&
    nowMs - lastSupport <= BLOCKING_HOLD_MAX_MINS * MINUTE;

  let status: EventStatus;
  let confidence = current.confidence;
  if (isCleared(current)) status = "cleared";
  else if (held) {
    status = "corroborated";
    confidence = peakBlockingConfidence;
  } else if (current.support === 0) status = "expired";
  else {
    status = tierOf(current.confidence);
    if (status === "pending" && publishedAt !== null) status = "expired";
  }

  const blocking = status === "corroborated" && (current.blocking || held);
  const active = status === "uncertain" || status === "corroborated";
  const expiresAt =
    !active ? null
    : blocking && policy.clearance_required ? lastSupport + BLOCKING_HOLD_MAX_MINS * MINUTE
    : fadeTime(items, nowMs);

  const observedTimes = items.map((item) => time(item.observed_at));
  const submittedTimes = items.map((item) => time(item.submitted_at));
  const first = items[0];
  return {
    id: `ev-${first.id}`,
    category,
    stop_id: first.stop_id,
    route_id: policy.requires_route ? first.route_id : null,
    status,
    confidence,
    support: current.support,
    counter: current.counter,
    blocking,
    details: held ? heldDetails(category, current.details) : current.details,
    independent_sources: current.independent,
    official_sources: current.official,
    confirmations: current.confirmations,
    first_observed_at: new Date(Math.min(...observedTimes)).toISOString(),
    last_observed_at: new Date(Math.max(...observedTimes)).toISOString(),
    first_submitted_at: new Date(Math.min(...submittedTimes)).toISOString(),
    published_at: publishedAt === null ? null : new Date(publishedAt).toISOString(),
    expires_at: expiresAt === null ? null : new Date(expiresAt).toISOString(),
    evidence_ids: items.map((item) => item.id),
    weights: current.weights,
    replay: items.some((item) => item.replay),
  };
}

/**
 * Derives events from all evidence as of `now`. Deterministic and pure, so
 * the same function serves the live feed, controlled replays, and the
 * evaluation of verification quality.
 */
export function deriveEvents(evidence: readonly Evidence[], now: Date): TransitEvent[] {
  const visible = evidence.filter((item) => time(item.submitted_at) <= now.getTime());
  return cluster(visible).map((items) => evaluateCluster(items, now));
}

export function isActiveEvent(event: TransitEvent): boolean {
  return event.status === "uncertain" || event.status === "corroborated";
}
