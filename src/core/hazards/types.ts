import type { ReplayTag } from "@/core/sensing/types";

export type HazardSourceId = "pagasa" | "dost_asti" | "phivolcs";

/**
 * How an official record reached the system. A cached or manually entered
 * record must never be presented as a connected live feed.
 */
export type OfficialConnection = "live" | "cached" | "manual";
export type FeedStatus = OfficialConnection | "not_connected";

/**
 * Static hazard context (susceptibility maps), timestamped sensor readings,
 * and active advisories are different kinds of evidence and are interpreted
 * differently: only sensor readings above threshold count as evidence of a
 * current condition; the others are shown as context.
 */
export type OfficialKind = "advisory" | "sensor_reading" | "hazard_context";

export interface OfficialArea {
  label: string;
  lat: number;
  lng: number;
  radius_km: number;
}

export interface SensorReading {
  metric: "water_level_m" | "rainfall_mm_hr";
  value: number;
  /** Level at which the reading indicates a flooding condition. */
  threshold: number;
}

export interface OfficialObservation {
  id: string;
  source: HazardSourceId;
  kind: OfficialKind;
  title: string;
  summary: string;
  area: OfficialArea;
  reading?: SensorReading;
  observed_at: string;
  valid_until: string | null;
  connection: OfficialConnection;
  replay: ReplayTag | null;
}

export interface HazardSourceInfo {
  id: HazardSourceId;
  name: string;
  products: string[];
  kinds: OfficialKind[];
  reference_url: string;
}

export interface HazardSourceStatus extends HazardSourceInfo {
  status: FeedStatus;
  checked_at: string | null;
  disclosure: string;
}

export interface HazardNotice {
  observation_id: string;
  source: HazardSourceId;
  kind: OfficialKind;
  title: string;
  summary: string;
  area_label: string;
  affected_stop_ids: string[];
  observed_at: string;
  valid_until: string | null;
  connection: OfficialConnection;
  /** True when the reading also entered event scoring as flooding evidence. */
  used_as_evidence: boolean;
  replay: boolean;
}
