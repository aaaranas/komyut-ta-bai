import type maplibregl from "maplibre-gl";

/**
 * Selectable raster basemaps. All are free and need no API key. (Live traffic
 * tiles would require a paid keyed provider, so they're not offered here.)
 */
export interface Basemap {
  id: string;
  label: string;
  tiles: string[];
  attribution: string;
  maxzoom: number;
}

export const BASEMAPS: Basemap[] = [
  {
    id: "streets",
    label: "Streets",
    tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
    attribution: "© OpenStreetMap contributors",
    maxzoom: 19,
  },
  {
    id: "satellite",
    label: "Satellite",
    tiles: [
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    ],
    attribution: "Imagery © Esri, Maxar, Earthstar Geographics",
    maxzoom: 19,
  },
  {
    id: "terrain",
    label: "Terrain",
    tiles: [
      "https://a.tile.opentopomap.org/{z}/{x}/{y}.png",
      "https://b.tile.opentopomap.org/{z}/{x}/{y}.png",
      "https://c.tile.opentopomap.org/{z}/{x}/{y}.png",
    ],
    attribution: "© OpenStreetMap, SRTM | © OpenTopoMap (CC-BY-SA)",
    maxzoom: 17,
  },
];

export const DEFAULT_BASEMAP_ID = "streets";

const SOURCE_ID = "basemap";
const LAYER_ID = "basemap";

export function getBasemap(id: string): Basemap {
  return BASEMAPS.find((b) => b.id === id) ?? BASEMAPS[0];
}

/** Initial map style with the chosen basemap as the only (bottom) layer. */
export function rasterStyle(basemap: Basemap): maplibregl.StyleSpecification {
  return {
    version: 8,
    sources: {
      [SOURCE_ID]: {
        type: "raster",
        tiles: basemap.tiles,
        tileSize: 256,
        attribution: basemap.attribution,
        maxzoom: basemap.maxzoom,
      },
    },
    layers: [{ id: LAYER_ID, type: "raster", source: SOURCE_ID }],
  };
}

/**
 * Swaps the basemap in place, keeping it beneath any overlay layers (route
 * lines, markers) that were added on top.
 */
export function applyBasemap(map: maplibregl.Map, basemap: Basemap): void {
  const firstOverlay = map
    .getStyle()
    .layers.find((layer) => layer.id !== LAYER_ID)?.id;

  if (map.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID);
  if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);

  map.addSource(SOURCE_ID, {
    type: "raster",
    tiles: basemap.tiles,
    tileSize: 256,
    attribution: basemap.attribution,
    maxzoom: basemap.maxzoom,
  });
  map.addLayer({ id: LAYER_ID, type: "raster", source: SOURCE_ID }, firstOverlay);
}
