import type { Mode } from "@/lib/types";

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
  icon: string;
  /** Hex color used for map lines and markers. */
  hex: string;
  /** Tailwind classes for badges/chips. */
  badge: string;
  /** Tailwind background class for timeline icons. */
  dot: string;
}

/**
 * Single source of truth for transport-mode presentation. Adding a new
 * mode means adding one entry here (plus the Mode union in types.ts).
 */
export const MODE_CONFIG: Record<Mode | "transfer", ModeConfig> = {
  bus: {
    label: "Bus",
    icon: "🚌",
    hex: "#2563eb",
    badge: "bg-blue-100 text-blue-800",
    dot: "bg-blue-600",
  },
  vhire: {
    label: "V-hire",
    icon: "🚐",
    hex: "#16a34a",
    badge: "bg-green-100 text-green-800",
    dot: "bg-green-600",
  },
  jeepney: {
    label: "Jeepney",
    icon: "🚙",
    hex: "#d97706",
    badge: "bg-amber-100 text-amber-800",
    dot: "bg-amber-600",
  },
  mjeepney: {
    label: "Modern Jeepney",
    icon: "🚍",
    hex: "#d97706",
    badge: "bg-amber-100 text-amber-800",
    dot: "bg-amber-600",
  },
  ferry: {
    label: "Ferry",
    icon: "⛴️",
    hex: "#0d9488",
    badge: "bg-teal-100 text-teal-800",
    dot: "bg-teal-600",
  },
  transfer: {
    label: "Walk / Transfer",
    icon: "🚶",
    hex: "#6b7280",
    badge: "bg-gray-100 text-gray-700",
    dot: "bg-gray-500",
  },
};

/** Cebu City center, the map's default view before fitting to stops. */
export const MAP_DEFAULT_CENTER: [number, number] = [123.8854, 10.3157];
export const MAP_DEFAULT_ZOOM = 10;
export const OSM_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
export const OSM_ATTRIBUTION = "© OpenStreetMap contributors";

export const INSTALL_PROMPT_DISMISS_KEY = "komyut-install-dismissed";
