import type { Mode, ServiceEvidence, StopType } from "@/core/transit/types";

/**
 * Authoring format for the curated dataset. Records stay close to how
 * contributors describe a route (ordered stops, fare, hours, headway);
 * `src/core/transit/normalize.ts` turns them into the planner's model.
 */

export interface StopRecord {
  id: string;
  name: string;
  lat: number;
  lng: number;
  municipality: string;
  type: StopType;
}

export type FareRecord =
  | {
      base_fare: number;
      per_km: number;
      /** Kilometres included in the base fare; defaults by mode when omitted. */
      base_km?: number;
      discounted_fare?: number;
    }
  | { base_fare: number; flat: true; discounted_fare?: number };

/** A per-day service window, e.g. weekday vs weekend hours. */
export interface ServiceWindowRecord {
  /** "Weekdays", "Saturday", "Sunday", "Weekends" or "Daily". */
  days: string;
  first_trip: string;
  last_trip: string;
  /** Human-readable headway, e.g. "every 5–20 min". */
  frequency: string;
}

export interface DepartureRecord {
  days: string;
  times: string[];
}

export interface RouteRecord {
  id: string;
  name: string;
  mode: Mode;
  operator: string;
  stops: { stop_id: string; sequence: number }[];
  fare: FareRecord;
  /** Total end-to-end travel time in minutes. */
  duration_mins: number;
  frequency_mins: number;
  first_trip: string;
  last_trip: string;
  verified_date: string;
  /** Detailed per-day service windows, when known (overrides the flat hours). */
  schedule?: ServiceWindowRecord[];
  /** Exact origin departures, only when a published timetable exists. */
  departures?: DepartureRecord[];
  /** Defaults to "both_ways"; set "one_way" when each direction has its own record. */
  direction?: "one_way" | "both_ways";
  /** How the headway was established; defaults from verification status. */
  headway_evidence?: ServiceEvidence;
  notes?: string;
  /** True for routes imported from external sources without field checks. */
  unverified?: boolean;
  /** Where an imported route came from. */
  source_url?: string;
}

export interface TransferRecord {
  from_stop_id: string;
  to_stop_id: string;
  walk_minutes: number;
  notes?: string;
}

/**
 * A route scraped from an external source that hasn't been field-verified.
 * Kept only as regeneration input for `scripts/build-jeepney-data.ts`.
 */
export interface ExperimentalRoute {
  code: string;
  mode: Mode;
  /** Endpoint summary, e.g. "Urgello St ⇄ North Bus Terminal". */
  summary: string;
  /** Raw path descriptions from the source (outbound first, then return). */
  paths: string[];
  source_url: string;
  fetched_date: string;
  status: "unverified";
}
