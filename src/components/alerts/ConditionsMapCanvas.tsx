"use client";

import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import { useMapTheme } from "@/hooks/useMapTheme";
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM, DEFAULT_BASEMAP_ID, basemapStyle } from "@/lib/basemaps";
import { dotMarker } from "@/lib/map-markers";

export interface ConditionMarker {
  id: string;
  lng: number;
  lat: number;
  color: string;
  label: string;
  /** Confirmed events are drawn larger and solid. */
  strong: boolean;
}

/** Map of active events, colored by category. */
export default function ConditionsMapCanvas({ markers }: { markers: ConditionMarker[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const key = JSON.stringify(markers);
  const theme = useMapTheme();

  useEffect(() => {
    if (!containerRef.current) return;
    const items: ConditionMarker[] = JSON.parse(key);
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: basemapStyle(DEFAULT_BASEMAP_ID, theme),
      center: MAP_DEFAULT_CENTER,
      zoom: MAP_DEFAULT_ZOOM,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }));
    const placed = items.map((item) => {
      const element = dotMarker(item.color, item.strong ? 20 : 14);
      element.style.opacity = item.strong ? "1" : "0.8";
      return new maplibregl.Marker({ element })
        .setLngLat([item.lng, item.lat])
        .setPopup(new maplibregl.Popup({ offset: 14 }).setText(item.label))
        .addTo(map);
    });
    if (items.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      items.forEach((item) => bounds.extend([item.lng, item.lat]));
      map.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 0 });
    }
    return () => {
      placed.forEach((marker) => marker.remove());
      map.remove();
    };
  }, [key, theme]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-hidden rounded-xl border"
      role="img"
      aria-label="Map of active alerts"
    />
  );
}
