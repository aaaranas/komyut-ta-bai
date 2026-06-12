export type StopType = "terminal" | "port" | "street_stop";

export type Mode = "bus" | "vhire" | "jeepney" | "mjeepney" | "ferry";

export interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  municipality: string;
  type: StopType;
}

export interface RouteStop {
  stop_id: string;
  sequence: number;
}

export type Fare =
  | { base_fare: number; per_km: number }
  | { base_fare: number; flat: true };

export interface Route {
  id: string;
  name: string;
  mode: Mode;
  operator: string;
  stops: RouteStop[];
  fare: Fare;
  /** Total end-to-end travel time in minutes. */
  duration_mins: number;
  frequency_mins: number;
  first_trip: string;
  last_trip: string;
  verified_date: string;
  /** True for routes imported from external sources without field checks. */
  unverified?: boolean;
  /** Where an imported route came from. */
  source_url?: string;
}

export interface Transfer {
  from_stop_id: string;
  to_stop_id: string;
  walk_minutes: number;
  notes?: string;
}

export interface Leg {
  from_stop: Stop;
  to_stop: Stop;
  /** Null for walking transfers. */
  route: Route | null;
  mode: Mode | "transfer";
  fare: number;
  duration_mins: number;
}

export interface JourneyResult {
  legs: Leg[];
  total_fare: number;
  total_duration_mins: number;
}

export type Preference = "fastest" | "cheapest";

/**
 * A route scraped from an external source that hasn't been field-verified.
 * Experimental routes have no stop coordinates or fares, so they are shown
 * in the route browser for research purposes but never fed to the planner.
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
