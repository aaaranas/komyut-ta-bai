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

/** Cebu City center, the default view before fitting to content. */
export const MAP_DEFAULT_CENTER: [number, number] = [123.8854, 10.3157];
export const MAP_DEFAULT_ZOOM = 10;

/** The map style for a basemap id in the given theme. */
export function basemapStyle(id: string, theme: MapTheme): string | maplibregl.StyleSpecification {
  return (BASEMAPS.find((basemap) => basemap.id === id) ?? BASEMAPS[0]).style(theme);
}

/** Casing color drawn under route lines so they read on either theme. */
export function casingColor(theme: MapTheme): string {
  return theme === "dark" ? "#121417" : "#ffffff";
}
