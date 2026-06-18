"use client";

import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import { MODE_CONFIG, OSM_ATTRIBUTION, OSM_TILE_URL } from "@/lib/constants";
import type { JourneyResult } from "@/lib/types";

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

export default function JourneyMap({ result }: { result: JourneyResult }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: OSM_RASTER_STYLE,
      attributionControl: { compact: true },
    });
    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right"
    );

    const bounds = new maplibregl.LngLatBounds();
    for (const leg of result.legs) {
      bounds.extend([leg.from_stop.lng, leg.from_stop.lat]);
      bounds.extend([leg.to_stop.lng, leg.to_stop.lat]);
    }

    map.on("load", () => {
      // Draw each leg as a colored line
      result.legs.forEach((leg, i) => {
        const isTransfer = leg.mode === "transfer";
        const color = isTransfer ? "#94a3b8" : (MODE_CONFIG[leg.mode]?.hex ?? "#64748b");
        const coords: [number, number][] = [
          [leg.from_stop.lng, leg.from_stop.lat],
          [leg.to_stop.lng, leg.to_stop.lat],
        ];

        map.addSource(`leg-${i}`, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: { type: "LineString", coordinates: coords },
          },
        });

        map.addLayer({
          id: `leg-${i}`,
          type: "line",
          source: `leg-${i}`,
          layout: { "line-cap": "round", "line-join": "round" },
          paint: {
            "line-color": color,
            "line-width": isTransfer ? 2 : 4,
            ...(isTransfer ? { "line-dasharray": [2, 2.5] } : {}),
          },
        });
      });

      // Intermediate stop circles (transfers + boarding points)
      const midStops = result.legs.slice(0, -1).map((leg) => leg.to_stop);
      if (midStops.length > 0) {
        map.addSource("mid-stops", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: midStops.map((s) => ({
              type: "Feature" as const,
              properties: { name: s.name },
              geometry: {
                type: "Point" as const,
                coordinates: [s.lng, s.lat],
              },
            })),
          },
        });
        map.addLayer({
          id: "mid-stops",
          type: "circle",
          source: "mid-stops",
          paint: {
            "circle-radius": 5,
            "circle-color": "#ffffff",
            "circle-stroke-color": "#334155",
            "circle-stroke-width": 2,
          },
        });
      }

      // Origin marker — teal pin
      const origin = result.legs[0].from_stop;
      new maplibregl.Marker({ color: "#0d9488" })
        .setLngLat([origin.lng, origin.lat])
        .setPopup(
          new maplibregl.Popup({ offset: 26 }).setHTML(
            `<strong>${origin.name}</strong><br/><span style="font-size:12px;color:#64748b">${origin.municipality}</span>`
          )
        )
        .addTo(map);

      // Destination marker — rose pin
      const dest = result.legs[result.legs.length - 1].to_stop;
      new maplibregl.Marker({ color: "#e11d48" })
        .setLngLat([dest.lng, dest.lat])
        .setPopup(
          new maplibregl.Popup({ offset: 26 }).setHTML(
            `<strong>${dest.name}</strong><br/><span style="font-size:12px;color:#64748b">${dest.municipality}</span>`
          )
        )
        .addTo(map);

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 52, maxZoom: 14, duration: 0 });
      }
    });

    return () => {
      map.remove();
    };
  }, [result]);

  return (
    <div
      ref={containerRef}
      className="mt-4 h-56 w-full overflow-hidden rounded-2xl border"
      role="img"
      aria-label="Map of your journey route"
    />
  );
}
