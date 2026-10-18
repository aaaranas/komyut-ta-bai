/**
 * Normalized transit model used by the planner and the sensing layer.
 * The dataset is authored in the simpler record format in
 * `src/data/schema.ts` and converted here by `normalize.ts`.
 */

export type Mode = "bus" | "mybus" | "vhire" | "jeepney" | "mjeepney" | "ferry";

/** Modes that run on roads, so road and flood conditions apply to them. */
export const ROAD_MODES: readonly Mode[] = [
  "bus",
  "mybus",
  "vhire",
  "jeepney",
  "mjeepney",
];

export type StopType = "terminal" | "port" | "street_stop";

/** Service days distinguished by the dataset's schedule windows. */
export type DayType = "weekday" | "saturday" | "sunday";

export interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  municipality: string;
  type: StopType;
}

export type Fare =
  | {
      kind: "distance";
      base_fare: number;
      /** Distance covered by the base fare (LTFRB PUJ matrices: first 4 km). */
      base_km: number;
      per_km: number;
    }
  | { kind: "flat"; amount: number; discounted_amount?: number };

/** How a route's headway or departure times were established. */
export type ServiceEvidence = "published" | "observed" | "estimate";

/** A frequency-based service period, e.g. weekdays 05:00–21:00 every ~10 min. */
export interface ServiceWindow {
  days: DayType[];
  /** First departure from the route's origin, "HH:MM". */
  start: string;
  /** Last departure from the route's origin, "HH:MM". */
  end: string;
  /** Typical headway used to estimate the expected wait (half of it). */
  headway_mins: number;
  headway_label: string;
}

export interface DepartureSet {
  days: DayType[];
  /** Departures from the route's origin, "HH:MM". */
  times: string[];
}

/**
 * GTFS distinguishes exact timetables from frequency-based service; informal
 * Cebu services are modeled by headway windows, never by invented timetables.
 */
export type Service =
  | { kind: "frequency"; windows: ServiceWindow[]; evidence: ServiceEvidence }
  | { kind: "scheduled"; departures: DepartureSet[]; evidence: ServiceEvidence };

export interface Provenance {
  status: "verified" | "unverified";
  /** Date the record was field-verified (or imported, when unverified). */
  date: string;
  source_url?: string;
}

export interface Route {
  id: string;
  name: string;
  mode: Mode;
  operator: string;
  /** Stops in travel order (the outbound order for both-way routes). */
  stop_ids: string[];
  fare: Fare;
  /** End-to-end in-vehicle time in minutes. */
  duration_mins: number;
  /**
   * "one_way" when the dataset models each direction as its own route;
   * "both_ways" when one record describes service in both directions.
   */
  direction: "one_way" | "both_ways";
  service: Service;
  provenance: Provenance;
  notes?: string;
}

export interface Transfer {
  from_stop_id: string;
  to_stop_id: string;
  minutes: number;
  /** Curated links come from the dataset; proximity links are generated. */
  source: "curated" | "proximity";
  notes?: string;
}

export interface Network {
  stops: Stop[];
  routes: Route[];
  transfers: Transfer[];
}

/** A departure moment: day of week (0 = Sunday) and minutes after midnight. */
export interface DepartureTime {
  dow: number;
  minutes: number;
}
