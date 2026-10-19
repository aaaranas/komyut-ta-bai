"use client";

import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import BasemapSwitcher from "@/components/map/BasemapSwitcher";
import { useMapTheme } from "@/hooks/useMapTheme";
import {
  casingColor,
  DEFAULT_BASEMAP_ID,
    MAP_DEFAULT_CENTER,
  MAP_DEFAULT_ZOOM,
  basemapStyle,
} from "@/lib/basemaps";
import type { NetworkLayer } from "@/components/map/NetworkMap";

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
  const [basemapId, setBasemapId] = useState(DEFAULT_BASEMAP_ID);
  const theme = useMapTheme();

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: basemapStyle(basemapId, theme),
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
          paint: { "line-color": layer.color, "line-width": 3.5, "line-opacity": 0.9 },
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
          "circle-color": casingColor(theme),
          "circle-stroke-color": theme === "dark" ? "#eceef1" : "#16181d",
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
  }, [layers, stops, basemapId, theme]);

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
  }, [hidden, layers, basemapId, theme]);


  return (
    <div className="relative h-[60vh] min-h-80 w-full">
      <div
        ref={containerRef}
        className="h-full w-full"
        role="img"
        aria-label="Map of the MyBus network"
      />
      <BasemapSwitcher value={basemapId} onChange={setBasemapId} />
    </div>
  );
}
