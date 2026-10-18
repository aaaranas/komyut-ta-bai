import type { HazardSourceId, OfficialArea, OfficialKind, SensorReading } from "@/core/hazards/types";
import type { ReportCategory, ReportDetails, ReportKind, TruthLabel } from "@/core/sensing/types";

/**
 * Controlled event replays (Chapter 1.5.2): scripted reports and official
 * records loaded at offsets from "now", so verification and routing can be
 * exercised without directing anyone into a hazardous corridor. Everything
 * loaded from a scenario is tagged and shown as replay data.
 */
export type ScenarioStep =
  | {
      type: "report";
      offset_mins: number;
      actor: string;
      category: ReportCategory;
      kind: ReportKind;
      stop_id: string;
      route_id: string | null;
      details: ReportDetails;
      distance_to_stop_m: number | null;
      /** Ground truth for evaluating the verification layer. */
      truth: TruthLabel;
    }
  | {
      type: "official";
      offset_mins: number;
      source: HazardSourceId;
      kind: OfficialKind;
      title: string;
      summary: string;
      area: OfficialArea;
      reading?: SensorReading;
      validity_mins: number;
    };

export interface Scenario {
  id: string;
  title: string;
  description: string;
  /** What the system should do, stated before running it. */
  expected: string;
  steps: ScenarioStep[];
}

const TALISAY_HALL = { lat: 10.253412, lng: 123.829326 };

export const SCENARIOS: readonly Scenario[] = [
  {
    id: "talisay-flood",
    title: "Flooding at Talisay City Hall",
    description:
      "Three commuters report impassable flooding on the MyBus Route 1 corridor within 15 minutes, a manually entered DOST-ASTI water-level reading crosses its threshold, and one far-away report elsewhere is false.",
    expected:
      "The Talisay event is published, then becomes blocking once independent sources agree; trips via Talisay City Hall are rerouted or flagged. The SM City Cebu report stays pending.",
    steps: [
      { type: "report", offset_mins: -14, actor: "A", category: "flooding", kind: "observation", stop_id: "mybus-talisay-city-hall", route_id: null, details: { flood_level: "impassable" }, distance_to_stop_m: 120, truth: "true" },
      { type: "report", offset_mins: -9, actor: "B", category: "flooding", kind: "observation", stop_id: "mybus-talisay-city-hall", route_id: null, details: { flood_level: "impassable" }, distance_to_stop_m: 80, truth: "true" },
      {
        type: "official",
        offset_mins: -7,
        source: "dost_asti",
        kind: "sensor_reading",
        title: "Water level above alert threshold",
        summary: "Replay reading for a water-level station near Talisay City Hall.",
        area: { label: "Talisay City Hall area", ...TALISAY_HALL, radius_km: 0.6 },
        reading: { metric: "water_level_m", value: 1.9, threshold: 1.2 },
        validity_mins: 60,
      },
      { type: "report", offset_mins: -4, actor: "C", category: "flooding", kind: "confirmation", stop_id: "mybus-talisay-city-hall", route_id: null, details: { flood_level: "impassable" }, distance_to_stop_m: 300, truth: "true" },
      { type: "report", offset_mins: -6, actor: "D", category: "flooding", kind: "observation", stop_id: "mybus-sm-city-cebu", route_id: null, details: { flood_level: "passable" }, distance_to_stop_m: 4200, truth: "false" },
    ],
  },
  {
    id: "01k-delay",
    title: "Delay on Jeepney 01K at SM City Cebu",
    description: "Two on-site commuters report 01K running about 20 minutes late at SM City Cebu.",
    expected: "Published as corroborated; 01K trips through SM City Cebu gain about 20 minutes.",
    steps: [
      { type: "report", offset_mins: -12, actor: "E", category: "delay", kind: "observation", stop_id: "mybus-sm-city-cebu", route_id: "jeep-01k-outbound", details: { delay_mins: 20 }, distance_to_stop_m: 60, truth: "true" },
      { type: "report", offset_mins: -5, actor: "F", category: "delay", kind: "observation", stop_id: "mybus-sm-city-cebu", route_id: "jeep-01k-outbound", details: { delay_mins: 20 }, distance_to_stop_m: 150, truth: "true" },
    ],
  },
  {
    id: "parkmall-full",
    title: "Full MyBus at Parkmall",
    description: "A rider reports Route 1 northbound buses arriving full at Parkmall; another confirms.",
    expected: "Boarding Route 1 at Parkmall adds a wait; the route itself is never disabled, and the event fades within about half an hour.",
    steps: [
      { type: "report", offset_mins: -3, actor: "G", category: "full_vehicle", kind: "observation", stop_id: "mybus-parkmall", route_id: "mybus-r1-northbound", details: {}, distance_to_stop_m: 40, truth: "true" },
      { type: "report", offset_mins: -1, actor: "H", category: "full_vehicle", kind: "confirmation", stop_id: "mybus-parkmall", route_id: "mybus-r1-northbound", details: {}, distance_to_stop_m: 90, truth: "true" },
    ],
  },
  {
    id: "naga-conflict",
    title: "Sparse, conflicting road report in Naga",
    description: "One report without location says the highway is closed in Naga; a later on-site commuter says it is clear.",
    expected: "The closure is never published or used for routing (one report, no location), and the later on-site clearance outweighs it. Its truth cannot be established, so it is labeled unknown rather than false.",
    steps: [
      { type: "report", offset_mins: -40, actor: "I", category: "road_disruption", kind: "observation", stop_id: "naga", route_id: null, details: { road_status: "closed" }, distance_to_stop_m: null, truth: "unknown" },
      { type: "report", offset_mins: -10, actor: "J", category: "road_disruption", kind: "clearance", stop_id: "naga", route_id: null, details: {}, distance_to_stop_m: 50, truth: "unknown" },
    ],
  },
];

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((scenario) => scenario.id === id);
}
