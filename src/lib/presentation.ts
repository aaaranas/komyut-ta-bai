import {
  Anchor,
  Building2,
  Bus,
  BusFront,
  CarFront,
  CircleCheck,
  CircleDashed,
  Clock,
  Construction,
  Footprints,
  Hourglass,
  MapPin,
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
import type { EventStatus, ReportCategory } from "@/core/sensing/types";
import type { Mode, StopType } from "@/core/transit/types";

type IconComponent = ComponentType<{ className?: string }>;

export interface ModeConfig {
  label: string;
  Icon: IconComponent;
  /** Hex color used for map lines and markers. */
  hex: string;
  /** Tailwind classes for badges/chips (light + dark). */
  badge: string;
  /** Tailwind background class for solid timeline icons. */
  dot: string;
}

/**
 * Single source of truth for transport-mode presentation. Adding a mode
 * means adding one entry here (plus the Mode union in core/transit/types).
 */
export const MODE_CONFIG: Record<Mode | "walk", ModeConfig> = {
  bus: {
    label: "Provincial bus",
    Icon: Bus,
    hex: "#2563eb",
    badge: "bg-blue-500/12 text-blue-700 dark:text-blue-300",
    dot: "bg-blue-600",
  },
  mybus: {
    label: "MyBus",
    Icon: BusFront,
    hex: "#e11d48",
    badge: "bg-rose-500/12 text-rose-700 dark:text-rose-300",
    dot: "bg-rose-600",
  },
  vhire: {
    label: "V-hire",
    Icon: CarFront,
    hex: "#7c3aed",
    badge: "bg-violet-500/12 text-violet-700 dark:text-violet-300",
    dot: "bg-violet-600",
  },
  jeepney: {
    label: "Jeepney (PUJ)",
    Icon: Jeepney,
    hex: "#f59e0b",
    badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  mjeepney: {
    label: "Modern PUJ",
    Icon: TramFront,
    hex: "#ea580c",
    badge: "bg-orange-500/12 text-orange-700 dark:text-orange-300",
    dot: "bg-orange-600",
  },
  ferry: {
    label: "Ferry",
    Icon: Ship,
    hex: "#0d9488",
    badge: "bg-teal-500/12 text-teal-700 dark:text-teal-300",
    dot: "bg-teal-600",
  },
  walk: {
    label: "Walk / transfer",
    Icon: Footprints,
    hex: "#64748b",
    badge: "bg-slate-500/12 text-slate-600 dark:text-slate-300",
    dot: "bg-slate-500",
  },
};

export const MODE_ORDER: Mode[] = ["jeepney", "mjeepney", "mybus", "bus", "vhire", "ferry"];

export interface StopTypeConfig {
  label: string;
  Icon: IconComponent;
  badge: string;
  /** Highlighted hub tile (bg + border + text). */
  tile: string;
}

export const STOP_TYPE_CONFIG: Record<StopType, StopTypeConfig> = {
  terminal: {
    label: "Terminal",
    Icon: Building2,
    badge: "bg-indigo-500/12 text-indigo-700 dark:text-indigo-300",
    tile: "border-indigo-200 bg-indigo-50 text-indigo-950 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-100",
  },
  port: {
    label: "Sea port",
    Icon: Anchor,
    badge: "bg-cyan-500/12 text-cyan-700 dark:text-cyan-300",
    tile: "border-cyan-200 bg-cyan-50 text-cyan-950 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-100",
  },
  street_stop: {
    label: "Stop",
    Icon: MapPin,
    badge: "bg-muted text-muted-foreground",
    tile: "border-border bg-card text-foreground",
  },
};

export interface CategoryConfig {
  label: string;
  /** Short question-style prompt for the report picker. */
  prompt: string;
  Icon: IconComponent;
  hex: string;
  /** Tile / chip classes. */
  tone: string;
  solid: string;
}

export const CATEGORY_CONFIG: Record<ReportCategory, CategoryConfig> = {
  delay: {
    label: "Delay",
    prompt: "Ride is late or not coming",
    Icon: Clock,
    hex: "#d97706",
    tone: "border-amber-300/60 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100",
    solid: "bg-amber-500 text-white",
  },
  flooding: {
    label: "Flooding",
    prompt: "Water on the road",
    Icon: Waves,
    hex: "#0284c7",
    tone: "border-sky-300/60 bg-sky-50 text-sky-900 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-100",
    solid: "bg-sky-600 text-white",
  },
  full_vehicle: {
    label: "Full vehicle",
    prompt: "No room to board",
    Icon: Users,
    hex: "#7c3aed",
    tone: "border-violet-300/60 bg-violet-50 text-violet-900 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-100",
    solid: "bg-violet-600 text-white",
  },
  road_disruption: {
    label: "Road problem",
    prompt: "Crash, roadwork, or closure",
    Icon: Construction,
    hex: "#ea580c",
    tone: "border-orange-300/60 bg-orange-50 text-orange-900 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-100",
    solid: "bg-orange-600 text-white",
  },
};

export interface StatusConfig {
  label: string;
  description: string;
  Icon: IconComponent;
  tone: string;
}

/** Event verification states, worded for commuters. */
export const STATUS_CONFIG: Record<EventStatus | "withdrawn", StatusConfig> = {
  pending: {
    label: "Awaiting confirmation",
    description: "Not shown to others until more evidence agrees.",
    Icon: Hourglass,
    tone: "bg-muted text-muted-foreground",
  },
  uncertain: {
    label: "Unconfirmed",
    description: "Published as a notice; routes are only lightly adjusted.",
    Icon: ShieldQuestion,
    tone: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
  },
  corroborated: {
    label: "Confirmed",
    description: "Independent evidence agrees; routes are adjusted.",
    Icon: ShieldCheck,
    tone: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300",
  },
  cleared: {
    label: "Cleared",
    description: "Later reports say it's over.",
    Icon: CircleCheck,
    tone: "bg-sky-500/15 text-sky-800 dark:text-sky-300",
  },
  expired: {
    label: "Expired",
    description: "Too old to affect routes now.",
    Icon: CircleDashed,
    tone: "bg-muted text-muted-foreground",
  },
  withdrawn: {
    label: "Withdrawn",
    description: "You withdrew this report.",
    Icon: Undo2,
    tone: "bg-muted text-muted-foreground",
  },
};

/** Headline for an event, e.g. "Flooding · not passable". */
export function eventHeadline(category: ReportCategory, details: {
  delay_mins?: number;
  flood_level?: string;
  road_status?: string;
}): string {
  const { label } = CATEGORY_CONFIG[category];
  if (category === "delay" && details.delay_mins) return `${label} · ~${Math.round(details.delay_mins)} min late`;
  if (category === "flooding" && details.flood_level) {
    return `${label} · ${details.flood_level === "impassable" ? "not passable" : "passable with care"}`;
  }
  if (category === "road_disruption" && details.road_status) {
    return `${label} · ${details.road_status === "closed" ? "road closed" : "slow traffic"}`;
  }
  return label;
}
