import type { Transfer } from "@/lib/types";

/**
 * Walkable interchanges where MyBus stops co-locate with city-jeepney stops,
 * so journeys can move between the two networks at these shared landmarks.
 */
export const myBusInterchanges: Transfer[] = [
  {
    from_stop_id: "mybus-sm-city-cebu",
    to_stop_id: "cj-sm-city-cebu",
    walk_minutes: 2,
    notes: "SM City Cebu — transfer between MyBus and city jeepneys.",
  },
  {
    from_stop_id: "mybus-robinsons-galleria",
    to_stop_id: "cj-robinsons-galleria-cebu",
    walk_minutes: 2,
    notes: "Robinsons Galleria — transfer between MyBus and city jeepneys.",
  },
];
