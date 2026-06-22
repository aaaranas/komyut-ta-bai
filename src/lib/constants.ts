import {
  Anchor,
  Building2,
  Bus,
  BusFront,
  CarFront,
  Footprints,
  MapPin,
  Ship,
  TramFront,
} from "lucide-react";
import type { ComponentType } from "react";
import { Jeepney } from "@/lib/icons";
import type { Mode, StopType } from "@/lib/types";

type IconComponent = ComponentType<{ className?: string }>;

/**
 * Cebu province bounding box used for data validation. The eastern bound
 * extends to 124.4°E (past the mainland's ~124.1°E) so the Camotes
 * Islands are included.
 */
export const CEBU_BOUNDS = {
  minLat: 9.4,
  maxLat: 11.3,
  minLng: 123.2,
  maxLng: 124.4,
} as const;

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
 * Single source of truth for transport-mode presentation. Adding a new
 * mode means adding one entry here (plus the Mode union in types.ts).
 */
export const MODE_CONFIG: Record<Mode | "transfer", ModeConfig> = {
  bus: {
    label: "Bus",
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
    label: "Jeepney",
    Icon: Jeepney,
    hex: "#f59e0b",
    badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  mjeepney: {
    label: "Modern Jeepney",
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
  transfer: {
    label: "Walk / Transfer",
    Icon: Footprints,
    hex: "#64748b",
    badge: "bg-slate-500/12 text-slate-600 dark:text-slate-300",
    dot: "bg-slate-500",
  },
};

export interface StopTypeConfig {
  /** Short label, e.g. "Terminal". */
  label: string;
  /** Longer label used in directory headings, e.g. "Bus & V-hire terminals". */
  groupLabel: string;
  Icon: IconComponent;
  /** Tailwind classes for the inline badge. */
  badge: string;
  /** Tailwind classes for a highlighted hub tile (bg + border + text). */
  tile: string;
}

/**
 * Presentation for the kinds of stops. Terminals and ports are the notable
 * interchange hubs surfaced across the app; street stops stay understated.
 */
export const STOP_TYPE_CONFIG: Record<StopType, StopTypeConfig> = {
  terminal: {
    label: "Terminal",
    groupLabel: "Bus & V-hire terminals",
    Icon: Building2,
    badge: "bg-indigo-500/12 text-indigo-700 dark:text-indigo-300",
    tile: "border-indigo-200 bg-indigo-50 text-indigo-950 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-100",
  },
  port: {
    label: "Sea port",
    groupLabel: "Sea ports",
    Icon: Anchor,
    badge: "bg-cyan-500/12 text-cyan-700 dark:text-cyan-300",
    tile: "border-cyan-200 bg-cyan-50 text-cyan-950 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-100",
  },
  street_stop: {
    label: "Stop",
    groupLabel: "Street stops",
    Icon: MapPin,
    badge: "bg-muted text-muted-foreground",
    tile: "border-border bg-card text-foreground",
  },
};

/** Stop types that count as notable interchange hubs. */
export const HUB_STOP_TYPES: StopType[] = ["terminal", "port"];

/** Cebu City center, the map's default view before fitting to stops. */
export const MAP_DEFAULT_CENTER: [number, number] = [123.8854, 10.3157];
export const MAP_DEFAULT_ZOOM = 10;

/** OpenStreetMap raster tiles — free, no API key. Used as the journey map basemap. */
export const OSM_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
export const OSM_ATTRIBUTION = "© OpenStreetMap contributors";

export const INSTALL_PROMPT_DISMISS_KEY = "komyut-install-dismissed";
