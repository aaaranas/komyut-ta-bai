"use client";

import { BASEMAPS } from "@/lib/basemaps";
import { cn } from "@/lib/utils";

/** Small overlay control to switch the map's basemap (streets/satellite/…). */
export default function BasemapSwitcher({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="absolute left-2 top-2 z-10 flex gap-0.5 rounded-lg border bg-card/90 p-0.5 shadow-sm backdrop-blur">
      {BASEMAPS.map((basemap) => (
        <button
          key={basemap.id}
          type="button"
          onClick={() => onChange(basemap.id)}
          aria-pressed={value === basemap.id}
          className={cn(
            "rounded-md px-2 py-1 text-xs font-medium transition-colors",
            value === basemap.id
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          {basemap.label}
        </button>
      ))}
    </div>
  );
}
