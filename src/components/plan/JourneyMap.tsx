"use client";

import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import { useConditions } from "@/components/providers/ConditionsProvider";
import type { Itinerary } from "@/core/planner";
import { getStop } from "@/core/transit/catalog";
import type { Stop } from "@/core/transit/types";
import { DEFAULT_BASEMAP_ID, getBasemap, rasterStyle } from "@/lib/basemaps";
import { CATEGORY_CONFIG, MODE_CONFIG } from "@/lib/presentation";

function popupHtml(title: string, subtitle: string): string {
  const escape = (text: string) =>
    text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  return `<strong>${escape(title)}</strong><br/><span style="font-size:12px;color:#64748b">${escape(subtitle)}</span>`;
}

/** Each leg drawn through the stops it actually visits, plus events on the trip. */
export default function JourneyMap({ itinerary }: { itinerary: Itinerary }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { eventsById } = useConditions();
  // Serialized so the map only rebuilds when this trip's events change,
  // not on every conditions poll.
  const eventMarkers = JSON.stringify(
    itinerary.event_ids.flatMap((id) => {
      const event = eventsById.get(id);
      const stop = event ? getStop(event.stop_id) : undefined;
      if (!event || !stop) return [];
      const config = CATEGORY_CONFIG[event.category];
      return [{ lng: stop.lng, lat: stop.lat, color: config.hex, label: config.label, place: stop.name }];
    })
  );

  useEffect(() => {
    if (!containerRef.current || itinerary.legs.length === 0) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: rasterStyle(getBasemap(DEFAULT_BASEMAP_ID)),
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    const bounds = new maplibregl.LngLatBounds();
    const markers: maplibregl.Marker[] = [];

    map.on("load", () => {
      itinerary.legs.forEach((leg, index) => {
        const path: Stop[] =
          leg.kind === "ride"
            ? leg.stop_ids.map((id) => getStop(id)).filter((s): s is Stop => !!s)
            : [leg.from, leg.to];
        const coordinates = path.map((stop) => [stop.lng, stop.lat]);
        coordinates.forEach((coordinate) => bounds.extend(coordinate as [number, number]));
        const isWalk = leg.kind === "walk";
        map.addSource(`leg-${index}`, {
          type: "geojson",
          data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates } },
        });
        map.addLayer({
          id: `leg-${index}`,
          type: "line",
          source: `leg-${index}`,
          layout: { "line-cap": "round", "line-join": "round" },
          paint: {
            "line-color": isWalk ? "#94a3b8" : MODE_CONFIG[leg.route.mode].hex,
            "line-width": isWalk ? 2.5 : 4.5,
            ...(isWalk ? { "line-dasharray": [2, 2.5] } : {}),
          },
        });
      });

      const origin = itinerary.legs[0].from;
      const destination = itinerary.legs[itinerary.legs.length - 1].to;
      markers.push(
        new maplibregl.Marker({ color: "#0d9488" })
          .setLngLat([origin.lng, origin.lat])
          .setPopup(new maplibregl.Popup({ offset: 26 }).setHTML(popupHtml(origin.name, origin.municipality)))
          .addTo(map),
        new maplibregl.Marker({ color: "#e11d48" })
          .setLngLat([destination.lng, destination.lat])
          .setPopup(new maplibregl.Popup({ offset: 26 }).setHTML(popupHtml(destination.name, destination.municipality)))
          .addTo(map)
      );

      const events: { lng: number; lat: number; color: string; label: string; place: string }[] =
        JSON.parse(eventMarkers);
      for (const event of events) {
        const element = document.createElement("div");
        element.className = "size-5 rounded-full border-2 border-white shadow";
        element.style.backgroundColor = event.color;
        markers.push(
          new maplibregl.Marker({ element })
            .setLngLat([event.lng, event.lat])
            .setPopup(new maplibregl.Popup({ offset: 14 }).setHTML(popupHtml(event.label, event.place)))
            .addTo(map)
        );
      }

      if (!bounds.isEmpty()) map.fitBounds(bounds, { padding: 52, maxZoom: 14, duration: 0 });
    });

    return () => {
      markers.forEach((marker) => marker.remove());
      map.remove();
    };
  }, [itinerary, eventMarkers]);

  return (
    <div
      ref={containerRef}
      className="mt-4 h-56 w-full overflow-hidden rounded-2xl border sm:h-72"
      role="img"
      aria-label="Map of your journey"
    />
  );
}
