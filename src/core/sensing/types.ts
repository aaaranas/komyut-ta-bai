import type { HazardSourceId, OfficialConnection } from "@/core/hazards/types";

/** The four commuter report categories (Chapter 1.5.3 delimitation). */
export type ReportCategory = "delay" | "flooding" | "full_vehicle" | "road_disruption";

export const REPORT_CATEGORIES: readonly ReportCategory[] = [
  "delay",
  "flooding",
  "full_vehicle",
  "road_disruption",
];

/**
 * A direct observation, a confirmation of an event someone else reported,
 * or a statement that the condition has cleared. Confirmations are kept
 * separate because several of them may repeat one visible claim rather than
 * independently observe the event (Lorenz et al., 2011).
 */
export type ReportKind = "observation" | "confirmation" | "clearance";

export type FloodLevel = "passable" | "impassable";
export type RoadStatus = "slow" | "closed";

export interface ReportDetails {
  delay_mins?: number;
  flood_level?: FloodLevel;
  road_status?: RoadStatus;
}

/** Ground-truth label used for reputation and for evaluating verification. */
export type TruthLabel = "true" | "false" | "unknown";
export type LabelBasis = "field_observation" | "official_record" | "controlled_scenario";

export interface ReplayTag {
  scenario_id: string;
}

/** A stored commuter report. `contributor` is a salted pseudonym, never a device id. */
export interface Report {
  id: string;
  category: ReportCategory;
  kind: ReportKind;
  stop_id: string;
  /** Affected service; required for delay and full-vehicle reports. */
  route_id: string | null;
  details: ReportDetails;
  contributor: string;
  observed_at: string;
  submitted_at: string;
  /**
   * Distance from the reporter to the stop when location was shared. Raw
   * coordinates are reduced to this on arrival and never stored.
   */
  distance_to_stop_m: number | null;
  withdrawn_at: string | null;
  replay: ReplayTag | null;
}

export interface ReportLabel {
  report_id: string;
  label: TruthLabel;
  basis: LabelBasis;
  labeled_at: string;
  note?: string;
}

/** Report or official reading, normalized for scoring. */
export interface Evidence {
  id: string;
  /** Independence unit: one pseudonym, or one official station/advisory. */
  source_key: string;
  origin: "commuter" | "official";
  kind: ReportKind;
  category: ReportCategory;
  stop_id: string;
  route_id: string | null;
  details: ReportDetails;
  observed_at: string;
  submitted_at: string;
  /** Contributor reputation or source credibility, 0–1. */
  credibility: number;
  /** Spatial consistency multiplier (on site, unknown, or far away). */
  site_factor: number;
  official?: { source: HazardSourceId; connection: OfficialConnection };
  replay: boolean;
}

export type EventStatus = "pending" | "uncertain" | "corroborated" | "cleared" | "expired";

export interface EvidenceWeight {
  evidence_id: string;
  origin: Evidence["origin"];
  kind: ReportKind;
  age_mins: number;
  weight: number;
  site_factor: number;
  official_source?: HazardSourceId;
  official_connection?: OfficialConnection;
}

/** A cluster of matched evidence about one condition at one place and service. */
export interface TransitEvent {
  id: string;
  category: ReportCategory;
  stop_id: string;
  route_id: string | null;
  status: EventStatus;
  /** Support discounted by clearance evidence, 0–1. */
  confidence: number;
  support: number;
  counter: number;
  blocking: boolean;
  details: ReportDetails;
  independent_sources: number;
  official_sources: number;
  confirmations: number;
  first_observed_at: string;
  last_observed_at: string;
  first_submitted_at: string;
  /** When confidence first reached the publication threshold. */
  published_at: string | null;
  /** When the event stops influencing routing absent new evidence (null = until cleared). */
  expires_at: string | null;
  evidence_ids: string[];
  weights: EvidenceWeight[];
  replay: boolean;
}

export interface Reputation {
  score: number;
  positive: number;
  negative: number;
}

export interface SegmentObservation {
  id: string;
  route_id: string;
  from_stop_id: string;
  to_stop_id: string;
  minutes: number;
  observed_at: string;
  contributor: string;
  trace_id: string;
  replay: ReplayTag | null;
}

export interface TravelTimeAggregate {
  route_id: string;
  from_stop_id: string;
  to_stop_id: string;
  median_mins: number;
  samples: number;
  contributors: number;
  latest_at: string;
}
