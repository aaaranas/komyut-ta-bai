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
import type { Stop } from "@/lib/types";

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

function createMap(container: HTMLDivElement): maplibregl.Map {
  const map = new maplibregl.Map({
    container,
    style: OSM_RASTER_STYLE,
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

function addRouteLine(map: maplibregl.Map, stops: Stop[], color: string): void {
  if (stops.length < 2) return;
  map.addSource("route-line", {
    type: "geojson",
    data: {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: stops.map((stop) => [stop.lng, stop.lat]),
      },
    },
  });
  map.addLayer({
    id: "route-line",
    type: "line",
    source: "route-line",
    paint: {
      "line-color": color,
      "line-width": 3,
      "line-dasharray": [1, 1.5],
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
  className?: string;
}

export default function MapView({ stops, color, className }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = createMap(containerRef.current);
    const markers = addStopMarkers(map, stops, color);
    map.on("load", () => {
      addRouteLine(map, stops, color);
      fitMapToStops(map, stops);
    });

    return () => {
      markers.forEach((marker) => marker.remove());
      map.remove();
    };
  }, [stops, color]);

  return (
    <div
      ref={containerRef}
      className={className ?? "h-72 w-full rounded-2xl"}
      role="img"
      aria-label="Map of route stops"
    />
  );
}
