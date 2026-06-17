"use client";

import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import BasemapSwitcher from "@/components/map/BasemapSwitcher";
import {
  applyBasemap,
  DEFAULT_BASEMAP_ID,
  getBasemap,
  rasterStyle,
} from "@/lib/basemaps";
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from "@/lib/constants";
import type { Stop } from "@/lib/types";

function createMap(container: HTMLDivElement): maplibregl.Map {
  const map = new maplibregl.Map({
    container,
    style: rasterStyle(getBasemap(DEFAULT_BASEMAP_ID)),
    center: MAP_DEFAULT_CENTER,
    zoom: MAP_DEFAULT_ZOOM,
    attributionControl: { compact: true },
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }));
  return map;
}

function addStopMarkers(
  map: maplibregl.Map,
  stops: Stop[],
  color: string
): maplibregl.Marker[] {
  return stops.map((stop) =>
    new maplibregl.Marker({ color })
      .setLngLat([stop.lng, stop.lat])
      .setPopup(
        new maplibregl.Popup({ offset: 24 }).setText(
          `${stop.name} (${stop.municipality})`
        )
      )
      .addTo(map)
  );
}

function addRouteLine(
  map: maplibregl.Map,
  stops: Stop[],
  color: string,
  path?: [number, number][]
): void {
  // Prefer a road-following polyline when supplied; otherwise connect stops.
  const coordinates =
    path && path.length >= 2 ? path : stops.map((stop) => [stop.lng, stop.lat]);
  if (coordinates.length < 2) return;
  // A solid line reads as the real road path; dashed implies "approximate".
  const isRoadPath = Boolean(path && path.length >= 2);
  map.addSource("route-line", {
    type: "geojson",
    data: {
      type: "Feature",
      properties: {},
      geometry: { type: "LineString", coordinates },
    },
  });
  map.addLayer({
    id: "route-line",
    type: "line",
    source: "route-line",
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": color,
      "line-width": 4,
      ...(isRoadPath ? {} : { "line-dasharray": [1, 1.5] }),
    },
  });
}

function fitMapToStops(map: maplibregl.Map, stops: Stop[]): void {
  if (stops.length === 0) return;
  const bounds = new maplibregl.LngLatBounds();
  for (const stop of stops) bounds.extend([stop.lng, stop.lat]);
  map.fitBounds(bounds, { padding: 48, maxZoom: 13, duration: 0 });
}

interface MapViewProps {
  stops: Stop[];
  /** Line/marker color, typically the route's mode color. */
  color: string;
  /** Optional road-following polyline; falls back to straight stop links. */
  path?: [number, number][];
  className?: string;
}

export default function MapView({ stops, color, path, className }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [basemapId, setBasemapId] = useState(DEFAULT_BASEMAP_ID);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = createMap(containerRef.current);
    mapRef.current = map;
    const markers = addStopMarkers(map, stops, color);
    map.on("load", () => {
      addRouteLine(map, stops, color, path);
      fitMapToStops(map, stops);
    });

    return () => {
      mapRef.current = null;
      markers.forEach((marker) => marker.remove());
      map.remove();
    };
  }, [stops, color, path]);

  const handleBasemapChange = (id: string) => {
    setBasemapId(id);
    const map = mapRef.current;
    if (map?.isStyleLoaded()) applyBasemap(map, getBasemap(id));
    else map?.once("idle", () => applyBasemap(map, getBasemap(id)));
  };

  return (
    <div className={`relative ${className ?? "h-72 w-full rounded-2xl"}`}>
      <div
        ref={containerRef}
        className="h-full w-full"
        role="img"
        aria-label="Map of route stops"
      />
      <BasemapSwitcher value={basemapId} onChange={handleBasemapChange} />
    </div>
  );
}
