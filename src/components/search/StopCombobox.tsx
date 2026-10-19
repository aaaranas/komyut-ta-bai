"use client";

import { Loader2, LocateFixed } from "lucide-react";
import { useId, useMemo, useRef, useState } from "react";
import { StopKind } from "@/components/common/badges";
import { HUB_STOP_TYPES, stops } from "@/core/transit/catalog";
import { nearest } from "@/core/transit/geo";
import type { Stop } from "@/core/transit/types";
import { cn } from "@/lib/utils";

type GeoState = "idle" | "loading" | "error";

/** Terminals and ports first, so major hubs surface to the top. */
function byHubThenName(a: Stop, b: Stop): number {
  const aHub = HUB_STOP_TYPES.includes(a.type) ? 0 : 1;
  const bHub = HUB_STOP_TYPES.includes(b.type) ? 0 : 1;
  return aHub - bHub || a.name.localeCompare(b.name);
}

function matchStops(query: string): Stop[] {
  const needle = query.trim().toLowerCase();
  const matched =
    needle === ""
      ? stops
      : stops.filter(
          (stop) => stop.name.toLowerCase().includes(needle) || stop.municipality.toLowerCase().includes(needle)
        );
  return [...matched].sort(byHubThenName).slice(0, 50);
}

interface Props {
  label: string;
  placeholder: string;
  value: Stop | null;
  onChange: (stop: Stop | null) => void;
  /** "bare" drops the border so the field can sit inside a grouped control. */
  variant?: "field" | "bare";
  /** Shown before the input, e.g. an origin or destination dot. */
  leading?: React.ReactNode;
}

export default function StopCombobox({ label, placeholder, value, onChange, variant = "field", leading }: Props) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [geoState, setGeoState] = useState<GeoState>("idle");
  const [nearbyStops, setNearbyStops] = useState<Stop[] | null>(null);
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const suggestions = useMemo(
    () => (nearbyStops && query === "" ? nearbyStops : matchStops(query)),
    [query, nearbyStops]
  );
  const isNearbyMode = nearbyStops !== null && query === "";

  const handleInputChange = (text: string) => {
    onChange(null);
    setQuery(text);
    setNearbyStops(null);
    setOpen(true);
  };

  const handleSelect = (stop: Stop) => {
    onChange(stop);
    setQuery("");
    setOpen(false);
    setNearbyStops(null);
  };

  const handleLocate = () => {
    if (!("geolocation" in navigator)) return;
    setGeoState("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setNearbyStops(
          nearest({ lat: position.coords.latitude, lng: position.coords.longitude }, stops, 8).map(({ item }) => item)
        );
        setGeoState("idle");
        setOpen(true);
      },
      () => {
        setGeoState("error");
        setTimeout(() => setGeoState("idle"), 3000);
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="relative">
      <label htmlFor={id} className={variant === "bare" ? "sr-only" : "mb-1.5 block text-sm font-medium"}>
        {label}
      </label>
      <div
        className={cn(
          "flex items-center gap-3",
          variant === "field" && "rounded-lg border border-input bg-background px-3 focus-within:border-ring"
        )}
      >
        {leading}
        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          autoComplete="off"
          placeholder={placeholder}
          value={value ? value.name : query}
          onChange={(event) => handleInputChange(event.target.value)}
          onFocus={() => {
            if (blurTimeout.current) clearTimeout(blurTimeout.current);
            setOpen(true);
          }}
          onBlur={() => {
            blurTimeout.current = setTimeout(() => setOpen(false), 150);
          }}
          className="h-12 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
        />
        <button
          type="button"
          aria-label="Find stops near me"
          title={geoState === "error" ? "Location unavailable" : "Find stops near me"}
          onClick={handleLocate}
          onMouseDown={(event) => event.preventDefault()}
          disabled={geoState === "loading"}
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-md transition-colors",
            geoState === "error" ? "text-destructive" : isNearbyMode ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {geoState === "loading" ? <Loader2 className="size-4 animate-spin" /> : <LocateFixed className="size-4" />}
        </button>
      </div>
      {open && suggestions.length > 0 && (
        <ul
          id={`${id}-list`}
          role="listbox"
          className="absolute inset-x-0 z-20 mt-1 max-h-80 overflow-auto rounded-lg border bg-popover py-1 shadow-[0_8px_24px_rgb(0_0_0/0.08)]"
        >
          {isNearbyMode && <li className="px-3 py-1.5 text-xs text-muted-foreground">Nearest to you</li>}
          {suggestions.map((stop) => (
            <li key={stop.id} role="option" aria-selected={value?.id === stop.id}>
              <button
                type="button"
                onClick={() => handleSelect(stop)}
                className="flex min-h-11 w-full flex-col justify-center px-3 py-1.5 text-left hover:bg-accent"
              >
                <span className="text-sm font-medium">
                  {stop.name}
                  <StopKind type={stop.type} />
                </span>
                <span className="text-xs text-muted-foreground">{stop.municipality}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
