import type { HazardNotice, HazardSourceStatus } from "@/core/hazards/types";
import type { ConditionEffect } from "@/core/planner/conditions";
import type { TransitEvent, TravelTimeAggregate } from "@/core/sensing/types";

export type StorageMode = "file" | "temporary";

/** A published event plus the graph operation and consequence it implies. */
export interface PublicEvent extends TransitEvent {
  effect: ConditionEffect | null;
  consequence: string;
}

/**
 * Everything the client needs to enrich the baseline plan, served by
 * `GET /api/conditions`. Only published events (uncertain or corroborated)
 * are included; pending reports stay server-side until verified.
 */
export interface ConditionsSnapshot {
  generated_at: string;
  /** Time the events were evaluated at (differs from now only in the lab). */
  as_of: string;
  storage: StorageMode;
  policy_version: string;
  events: PublicEvent[];
  effects: ConditionEffect[];
  travel_times: TravelTimeAggregate[];
  hazards: {
    sources: HazardSourceStatus[];
    notices: HazardNotice[];
  };
}
