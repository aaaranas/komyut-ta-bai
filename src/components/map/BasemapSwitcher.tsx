"use client";

import { BASEMAPS } from "@/lib/basemaps";
import { cn } from "@/lib/utils";

/** Overlay control to switch the basemap. */
export default function BasemapSwitcher({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <div role="group" aria-label="Basemap" className="absolute left-2 top-2 z-10 flex rounded-lg border bg-background/95 p-0.5">
      {BASEMAPS.map((basemap) => (
        <button
          key={basemap.id}
          type="button"
          onClick={() => onChange(basemap.id)}
          aria-pressed={value === basemap.id}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
            value === basemap.id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {basemap.label}
        </button>
      ))}
    </div>
  );
}
