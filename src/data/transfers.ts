import type { Transfer } from "@/lib/types";

// Each transfer is walkable in both directions; the graph adds reverse edges.
export const transfers: Transfer[] = [
  {
    from_stop_id: "csbt",
    to_stop_id: "cnbt",
    walk_minutes: 40,
    notes:
      "Cross-city transfer via jeepney or taxi along N. Bacalso Ave / Osmeña Blvd. Budget extra time in rush hour.",
  },
  {
    from_stop_id: "hagnaya-bus",
    to_stop_id: "hagnaya-port",
    walk_minutes: 5,
    notes: "Short walk from the bus drop-off to the ferry terminal gate.",
  },
  {
    from_stop_id: "danao-terminal",
    to_stop_id: "danao-port",
    walk_minutes: 10,
    notes: "Walk past Danao City plaza down to the port.",
  },
  {
    from_stop_id: "santafe-port",
    to_stop_id: "santafe-town",
    walk_minutes: 5,
    notes: "Walk from the pier to the town center; trisikads also available.",
  },
];
