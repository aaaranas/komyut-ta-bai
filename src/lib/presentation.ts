import {
  Bus,
  BusFront,
  CarFront,
  CircleCheck,
  CircleDashed,
  Clock,
  Construction,
  Footprints,
  Hourglass,
  ShieldCheck,
  ShieldQuestion,
  Ship,
  TramFront,
  Undo2,
  Users,
  Waves,
} from "lucide-react";
import type { ComponentType } from "react";
import { Jeepney } from "@/components/icons";
import type { EventStatus, ReportCategory, ReportDetails } from "@/core/sensing/types";
import type { Mode, Route, StopType } from "@/core/transit/types";

type IconComponent = ComponentType<{ className?: string }>;

export interface ModeConfig {
  label: string;
  /** Plate text when a route has no code of its own. */
  short: string;
  Icon: IconComponent;
  /** Line color, used for plates, rails, and map lines. */
  hex: string;
  /** Text color that reads on `hex`. */
  ink: string;
}

/**
 * Transit line colors are the only saturated colors in the interface, so a
 * trip reads like a transit map. Adding a mode means one entry here plus the
 * Mode union in core/transit/types.
 */
export const MODE_CONFIG: Record<Mode | "walk", ModeConfig> = {
  jeepney: { label: "Jeepney", short: "PUJ", Icon: Jeepney, hex: "#E9A40F", ink: "#1B1406" },
  mjeepney: { label: "Modern jeepney", short: "e-PUJ", Icon: TramFront, hex: "#E2581C", ink: "#FFFFFF" },
  mybus: { label: "MyBus", short: "MyBus", Icon: BusFront, hex: "#D42A3C", ink: "#FFFFFF" },
  bus: { label: "Provincial bus", short: "Bus", Icon: Bus, hex: "#1F5FBF", ink: "#FFFFFF" },
  vhire: { label: "V-hire", short: "V-hire", Icon: CarFront, hex: "#6B3FBF", ink: "#FFFFFF" },
  ferry: { label: "Ferry", short: "Ferry", Icon: Ship, hex: "#0D8A8A", ink: "#FFFFFF" },
  walk: { label: "Walk", short: "Walk", Icon: Footprints, hex: "#9AA0A6", ink: "#16181D" },
};

export const MODE_ORDER: Mode[] = ["jeepney", "mjeepney", "mybus", "bus", "vhire", "ferry"];

export { routeCode, routeTitle } from "@/core/transit/naming";

/** Mode and operator, without repeating a name, e.g. "MyBus" not "MyBus, MyBus". */
export function routeSubtitle(route: Route): string {
  const mode = MODE_CONFIG[route.mode].label;
  return route.operator === mode ? mode : `${mode}, ${route.operator}`;
}

export const STOP_TYPE_LABEL: Record<StopType, string | null> = {
  terminal: "Terminal",
  port: "Port",
  street_stop: null,
};

export interface CategoryConfig {
  label: string;
  /** What the category means, in a commuter's words. */
  prompt: string;
  Icon: IconComponent;
  hex: string;
}

export const CATEGORY_CONFIG: Record<ReportCategory, CategoryConfig> = {
  delay: { label: "Delay", prompt: "Ride is late or not coming", Icon: Clock, hex: "#C27803" },
  flooding: { label: "Flooding", prompt: "Water on the road", Icon: Waves, hex: "#1677C9" },
  full_vehicle: { label: "Full vehicle", prompt: "No room to board", Icon: Users, hex: "#7445D1" },
  road_disruption: { label: "Road problem", prompt: "Crash, roadwork, or closure", Icon: Construction, hex: "#D4501A" },
};

export interface StatusConfig {
  label: string;
  description: string;
  Icon: IconComponent;
  /** Text color class. */
  tone: string;
}

/** Event verification states, worded for commuters. */
export const STATUS_CONFIG: Record<EventStatus | "withdrawn", StatusConfig> = {
  pending: {
    label: "Awaiting confirmation",
    description: "Hidden from others until more evidence agrees.",
    Icon: Hourglass,
    tone: "text-muted-foreground",
  },
  uncertain: {
    label: "Unconfirmed",
    description: "Shown as a notice; routes are only lightly adjusted.",
    Icon: ShieldQuestion,
    tone: "text-warn",
  },
  corroborated: {
    label: "Confirmed",
    description: "Independent evidence agrees; routes are adjusted.",
    Icon: ShieldCheck,
    tone: "text-live",
  },
  cleared: {
    label: "Cleared",
    description: "Later reports say it's over.",
    Icon: CircleCheck,
    tone: "text-muted-foreground",
  },
  expired: {
    label: "Expired",
    description: "Too old to affect routes now.",
    Icon: CircleDashed,
    tone: "text-muted-foreground",
  },
  withdrawn: {
    label: "Withdrawn",
    description: "You withdrew this report.",
    Icon: Undo2,
    tone: "text-muted-foreground",
  },
};

/** Headline for an event, e.g. "Flooding, not passable". */
export function eventHeadline(category: ReportCategory, details: ReportDetails): string {
  const { label } = CATEGORY_CONFIG[category];
  if (category === "delay" && details.delay_mins) return `${label}, about ${Math.round(details.delay_mins)} min`;
  if (category === "flooding" && details.flood_level) {
    return `${label}, ${details.flood_level === "impassable" ? "not passable" : "passable"}`;
  }
  if (category === "road_disruption" && details.road_status) {
    return details.road_status === "closed" ? "Road closed" : "Slow traffic";
  }
  return label;
}
