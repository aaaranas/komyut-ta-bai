"use client";

import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import {
  MAP_DEFAULT_CENTER,
  MAP_DEFAULT_ZOOM,
  OSM_ATTRIBUTION,
  OSM_TILE_URL,
} from "@/lib/constants";
import type { NetworkLayer } from "@/components/map/NetworkMap";

const OSM_RASTER_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: [OSM_TILE_URL],
      tileSize: 256,
      attribution: OSM_ATTRIBUTION,
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
};

const layerId = (routeId: string) => `route-${routeId}`;

interface Props {
  layers: NetworkLayer[];
  stops: { lng: number; lat: number; name: string }[];
  /** Route numbers currently toggled off. */
  hidden: number[];
}

export default function NetworkMapCanvas({ layers, stops, hidden }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: OSM_RASTER_STYLE,
      center: MAP_DEFAULT_CENTER,
      zoom: MAP_DEFAULT_ZOOM,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }));
    mapRef.current = map;

    map.on("load", () => {
      const bounds = new maplibregl.LngLatBounds();

      for (const layer of layers) {
        if (layer.coordinates.length < 2) continue;
        map.addSource(layerId(layer.id), {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: { type: "LineString", coordinates: layer.coordinates },
          },
        });
        map.addLayer({
          id: layerId(layer.id),
          type: "line",
          source: layerId(layer.id),
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": layer.color, "line-width": 3.5 },
        });
        for (const coord of layer.coordinates) bounds.extend(coord);
      }

      map.addSource("network-stops", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: stops.map((stop) => ({
            type: "Feature",
            properties: { name: stop.name },
            geometry: { type: "Point", coordinates: [stop.lng, stop.lat] },
          })),
        },
      });
      map.addLayer({
        id: "network-stops",
        type: "circle",
        source: "network-stops",
        paint: {
          "circle-radius": 3.5,
          "circle-color": "#ffffff",
          "circle-stroke-color": "#0f172a",
          "circle-stroke-width": 1.5,
        },
      });

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 40, duration: 0 });
      }
    });

    return () => {
      mapRef.current = null;
      map.remove();
    };
  }, [layers, stops]);

  // React to legend toggles without rebuilding the map.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => {
      for (const layer of layers) {
        if (!map.getLayer(layerId(layer.id))) continue;
        map.setLayoutProperty(
          layerId(layer.id),
          "visibility",
          hidden.includes(layer.routeNumber) ? "none" : "visible"
        );
      }
    };
    if (map.isStyleLoaded()) apply();
    else map.once("idle", apply);
  }, [hidden, layers]);

  return (
    <div
      ref={containerRef}
      className="h-[60vh] min-h-80 w-full"
      role="img"
      aria-label="Map of the MyBus network"
    />
  );
}
