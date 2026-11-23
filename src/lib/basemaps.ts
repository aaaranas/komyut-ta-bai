import { METRO_CEBU_BBOX } from "@/core/transit/scope";
import type maplibregl from "maplibre-gl";

export type MapTheme = "light" | "dark";

/**
 * Selectable basemaps, all keyless. The default is OpenFreeMap's muted
 * vector style matching the app theme (Positron or Dark), so transit lines
 * and alerts stay the loudest things on the map.
 */
export interface Basemap {
  id: string;
  label: string;
  style: (theme: MapTheme) => string | maplibregl.StyleSpecification;
}

function raster(tiles: string[], attribution: string, maxzoom: number): maplibregl.StyleSpecification {
  return {
    version: 8,
    sources: { basemap: { type: "raster", tiles, tileSize: 256, attribution, maxzoom } },
    layers: [{ id: "basemap", type: "raster", source: "basemap" }],
  };
}

export const BASEMAPS: Basemap[] = [
  {
    id: "minimal",
    label: "Map",
    style: (theme) => `https://tiles.openfreemap.org/styles/${theme === "dark" ? "dark" : "positron"}`,
  },
  {
    id: "streets",
    label: "Streets",
    style: () => raster(["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], "© OpenStreetMap contributors", 19),
  },
  {
    id: "satellite",
    label: "Satellite",
    style: () =>
      raster(
        ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
        "Imagery © Esri, Maxar, Earthstar Geographics",
        19
      ),
  },
];

export const DEFAULT_BASEMAP_ID = "minimal";

const { minLat, maxLat, minLng, maxLng } = METRO_CEBU_BBOX;

/** Metro Cebu, [[west, south], [east, north]]: the view when there is nothing else to fit. */
export const METRO_CEBU_BOUNDS: [[number, number], [number, number]] = [
  [minLng, minLat],
  [maxLng, maxLat],
];

/** Center of Metro Cebu, the default view before fitting to content. */
export const MAP_DEFAULT_CENTER: [number, number] = [(minLng + maxLng) / 2, (minLat + maxLat) / 2];
export const MAP_DEFAULT_ZOOM = 10;

/** The map style for a basemap id in the given theme. */
export function basemapStyle(id: string, theme: MapTheme): string | maplibregl.StyleSpecification {
  return (BASEMAPS.find((basemap) => basemap.id === id) ?? BASEMAPS[0]).style(theme);
}

/** Casing color drawn under route lines so they read on either theme. */
export function casingColor(theme: MapTheme): string {
  return theme === "dark" ? "#121417" : "#ffffff";
}
