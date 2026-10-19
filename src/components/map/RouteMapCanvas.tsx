"use client";

import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import BasemapSwitcher from "@/components/map/BasemapSwitcher";
import type { Stop } from "@/core/transit/types";
import { useMapTheme } from "@/hooks/useMapTheme";
import {
  casingColor,
  DEFAULT_BASEMAP_ID,
    MAP_DEFAULT_CENTER,
  MAP_DEFAULT_ZOOM,
  basemapStyle,
  type MapTheme,
} from "@/lib/basemaps";
import { dotMarker, endpointMarker } from "@/lib/map-markers";

function addRouteLine(map: maplibregl.Map, stops: Stop[], color: string, theme: MapTheme, path?: [number, number][]) {
  // Prefer a road-following polyline; otherwise connect the stops.
  const isRoadPath = Boolean(path && path.length >= 2);
  const coordinates = isRoadPath ? path! : stops.map((stop) => [stop.lng, stop.lat]);
  if (coordinates.length < 2) return;
  map.addSource("route-line", {
    type: "geojson",
    data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates } },
  });
  map.addLayer({
    id: "route-casing",
    type: "line",
    source: "route-line",
    layout: { "line-cap": "round", "line-join": "round" },
    paint: { "line-color": casingColor(theme), "line-width": 8 },
  });
  map.addLayer({
    id: "route-line",
    type: "line",
    source: "route-line",
    layout: { "line-cap": "round", "line-join": "round" },
    // Dashed where only straight stop-to-stop links are known.
    paint: { "line-color": color, "line-width": 4.5, ...(isRoadPath ? {} : { "line-dasharray": [1.5, 1.2] }) },
  });
}

interface RouteMapCanvasProps {
  stops: Stop[];
  /** The route's line color. */
  color: string;
  /** Optional road-following polyline; falls back to straight stop links. */
  path?: [number, number][];
  className?: string;
}

export default function RouteMapCanvas({ stops, color, path, className }: RouteMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = useMapTheme();
  const [basemapId, setBasemapId] = useState(DEFAULT_BASEMAP_ID);

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

    const markers = stops.map((stop, index) => {
      const isEnd = index === 0 || index === stops.length - 1;
      const element = isEnd ? endpointMarker(index === 0 ? "origin" : "destination") : dotMarker(color, 11, false);
      return new maplibregl.Marker({ element })
        .setLngLat([stop.lng, stop.lat])
        .setPopup(new maplibregl.Popup({ offset: 10 }).setText(`${stop.name}, ${stop.municipality}`))
        .addTo(map);
    });

    map.on("load", () => {
      addRouteLine(map, stops, color, theme, path);
      if (stops.length > 0) {
        const bounds = new maplibregl.LngLatBounds();
        for (const stop of stops) bounds.extend([stop.lng, stop.lat]);
        map.fitBounds(bounds, { padding: 48, maxZoom: 14, duration: 0 });
      }
    });

    return () => {
      markers.forEach((marker) => marker.remove());
      map.remove();
    };
  }, [stops, color, path, basemapId, theme]);

  return (
    <div className={`relative ${className ?? "h-full w-full"}`}>
      <div ref={containerRef} className="h-full w-full" role="img" aria-label="Map of route stops" />
      <BasemapSwitcher value={basemapId} onChange={setBasemapId} />
    </div>
  );
}
