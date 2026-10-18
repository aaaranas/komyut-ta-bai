import type { CompiledConditions } from "@/core/planner/conditions";
import type { RideEdge, WalkEdge } from "@/core/planner/graph";
import type { DepartureTime, Route, Stop } from "@/core/transit/types";

export type Preference = "fastest" | "cheapest";

export interface PlanRequest {
  origin: string;
  destination: string;
  preference: Preference;
  depart: DepartureTime;
  /** Maximum vehicles boarded (1 = direct only); undefined = unlimited. */
  maxRides?: number;
  /** Live overlay; omitted for the baseline (curated data only). */
  conditions?: CompiledConditions;
}

/** All times are absolute minutes from midnight of the departure day. */
export interface RideLeg {
  kind: "ride";
  route: Route;
  from: Stop;
  to: Stop;
  /** Stops visited on this vehicle, boarding and alighting stops included. */
  stop_ids: string[];
  arrive_stop_at: number;
  board_at: number;
  alight_at: number;
  wait_mins: number;
  /** True when the wait is half a headway rather than a known departure. */
  wait_estimated: boolean;
  ride_mins: number;
  km: number;
  fare: number;
  discounted_fare: number;
  event_ids: string[];
  hops: RideEdge[];
}

export interface WalkLeg {
  kind: "walk";
  from: Stop;
  to: Stop;
  start_at: number;
  end_at: number;
  minutes: number;
  source: WalkEdge["source"];
  notes?: string;
  event_ids: string[];
  hops: WalkEdge[];
}

export type Leg = RideLeg | WalkLeg;

export interface Itinerary {
  legs: Leg[];
  depart_at: number;
  arrive_at: number;
  total_mins: number;
  waiting_mins: number;
  riding_mins: number;
  walking_mins: number;
  fare: number;
  discounted_fare: number;
  rides: number;
  /** Every event that changed a cost on this itinerary. */
  event_ids: string[];
}

export type PlanOutcome =
  | { status: "ok"; itinerary: Itinerary }
  | { status: "same_stop" }
  | { status: "unknown_stop" }
  | { status: "no_route" };

/** Re-timing an existing itinerary under different conditions. */
export type RetimeOutcome =
  | { status: "ok"; itinerary: Itinerary }
  | { status: "blocked"; event_ids: string[] };
