import type { OfficialConnection } from "@/core/hazards/types";
import type { ReportCategory, ReportKind } from "@/core/sensing/types";

/**
 * Design inputs for verification and confidence weighting. These are
 * proposed values under evaluation (Objective 4), not calibrated
 * probabilities; change them here and every consumer follows.
 */
export const POLICY_VERSION = "2026-11-23.1";

export interface CategoryPolicy {
  label: string;
  /** Reports this far apart (or closer) are matched into one event. */
  match_window_mins: number;
  /** Evidence weight halves every this many minutes. */
  half_life_mins: number;
  /** Evidence older than this no longer counts. */
  max_age_mins: number;
  /** Must the report name the affected service? */
  requires_route: boolean;
  /**
   * Blocking events of this category persist until a clearance arrives
   * (or the hold cap passes), instead of expiring on the generic timer.
   */
  clearance_required: boolean;
}

export const CATEGORY_POLICY: Record<ReportCategory, CategoryPolicy> = {
  // Vehicle fullness changes within minutes and stays tied to one service.
  full_vehicle: {
    label: "Full vehicle",
    match_window_mins: 20,
    half_life_mins: 10,
    max_age_mins: 30,
    requires_route: true,
    clearance_required: false,
  },
  delay: {
    label: "Delay",
    match_window_mins: 45,
    half_life_mins: 20,
    max_age_mins: 90,
    requires_route: true,
    clearance_required: false,
  },
  flooding: {
    label: "Flooding",
    match_window_mins: 180,
    half_life_mins: 60,
    max_age_mins: 360,
    requires_route: false,
    clearance_required: true,
  },
  road_disruption: {
    label: "Road disruption",
    match_window_mins: 360,
    half_life_mins: 120,
    max_age_mins: 720,
    requires_route: false,
    clearance_required: true,
  },
};

/** A confirmation is weaker evidence than an independent observation. */
export const KIND_WEIGHT: Record<ReportKind, number> = {
  observation: 1,
  confirmation: 0.6,
  clearance: 1,
};

/** Reporter within this distance of the stop counts as on site. */
export const ON_SITE_RADIUS_M = 500;

/** Spatial consistency multipliers. */
export const SITE_FACTOR = {
  on_site: 1,
  unknown: 0.85,
  far: 0.6,
} as const;

/**
 * Credibility of official evidence by how it reached the system. A fresh
 * live reading can corroborate an event alone; a manually entered record
 * alone only reaches "uncertain" and needs agreeing evidence.
 */
export const OFFICIAL_CREDIBILITY: Record<OfficialConnection, number> = {
  live: 0.8,
  cached: 0.7,
  manual: 0.55,
};

export const THRESHOLDS = {
  /** θ_pub: an event is first published when its confidence reaches this. */
  publish: 0.45,
  /**
   * θ_exp: a published event expires only when confidence falls below this
   * (θ_exp < θ_pub), so an event near the threshold doesn't flicker.
   */
  expire: 0.3,
  /** Published with its full routing effect. */
  corroborated: 0.6,
  /**
   * Needed before a segment is disabled, together with at least two
   * independent sources (an official reading counts as one).
   */
  blocking: 0.8,
  blocking_min_independent_sources: 2,
  /** Clearance evidence at or above this, and above support, clears an event. */
  clearance: 0.6,
} as const;

/** Upper bound on how long a blocking event holds without any new evidence. */
export const BLOCKING_HOLD_MAX_MINS = 24 * 60;

/** Reputation evidence (labels) halves in weight every this many days. */
export const REPUTATION_HALF_LIFE_DAYS = 90;

/**
 * Edge weights under an active event: w(e) = w₀(e) · (1 + αₖ · C), with C the
 * event's confidence, so the effect grows with the evidence and never falls
 * below baseline (Dijkstra stays valid). w(e) = ∞ (a closure) only when the
 * event marks e impassable and C ≥ θ_block with independent agreement.
 */
export const EFFECT_ALPHA = {
  /** Road and foot edges at a flooded stop: passable water, or impassable but not yet blocking. */
  flooding: { passable: 0.3, impassable: 1 },
  /** Road edges leaving a disrupted stop: slow traffic, or a reported closure not yet blocking. */
  road_disruption: { slow: 1.5, closed: 3 },
} as const;

/**
 * Additive effects scale the same way: a delay adds C × the reported minutes
 * to that service's hops; a full vehicle adds C × about one headway of wait
 * to boarding that service at that stop, and never disables the route.
 */
export const ADDITIVE_EFFECT = {
  /** Assumed delay when a report gives no minutes. */
  default_delay_mins: 10,
  full_vehicle_headways: 1,
} as const;

/** Aggregated GPS travel times are only published with this much support. */
export const TRAVEL_TIME_POLICY = {
  window_mins: 120,
  min_samples: 3,
  min_contributors: 2,
  max_accuracy_m: 75,
  stop_radius_m: 120,
  max_speed_kmh: 90,
  /** Observed hop time may not exceed this multiple of the baseline. */
  max_baseline_ratio: 4,
} as const;
