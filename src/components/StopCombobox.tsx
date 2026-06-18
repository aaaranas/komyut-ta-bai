"use client";

import { Loader2, LocateFixed, Search } from "lucide-react";
import { useId, useMemo, useRef, useState } from "react";
import StopTypeBadge from "@/components/StopTypeBadge";
import { Input } from "@/components/ui/input";
import { stops } from "@/lib/catalog";
import { HUB_STOP_TYPES, STOP_TYPE_CONFIG } from "@/lib/constants";
import { haversineKm } from "@/lib/utils/geo";
import type { Stop } from "@/lib/types";

type GeoState = "idle" | "loading" | "error";

/** Major hubs first, so terminals and ports surface to the top of the list. */
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
          (stop) =>
            stop.name.toLowerCase().includes(needle) ||
            stop.municipality.toLowerCase().includes(needle)
        );
  return [...matched].sort(byHubThenName).slice(0, 50);
}

function nearestStops(lat: number, lng: number): Stop[] {
  return [...stops]
    .map((s) => ({ stop: s, dist: haversineKm(lat, lng, s.lat, s.lng) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 10)
    .map(({ stop }) => stop);
}

interface Props {
  label: string;
  placeholder: string;
  value: Stop | null;
  onChange: (stop: Stop | null) => void;
}

export default function StopCombobox({
  label,
  placeholder,
  value,
  onChange,
}: Props) {
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

  const handleInputChange = (text: string) => {
    onChange(null);
    setQuery(text);
    setNearbyStops(null);
    setOpen(true);
  };

  const handleFocus = () => {
    if (blurTimeout.current) clearTimeout(blurTimeout.current);
    setOpen(true);
  };

  const handleBlur = () => {
    blurTimeout.current = setTimeout(() => setOpen(false), 150);
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
      (pos) => {
        const nearby = nearestStops(pos.coords.latitude, pos.coords.longitude);
        setNearbyStops(nearby);
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

  const isNearbyMode = nearbyStops !== null && query === "";

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-foreground"
      >
        {label}
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          type="text"
          autoComplete="off"
          placeholder={placeholder}
          value={value ? value.name : query}
          onChange={(event) => handleInputChange(event.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="pl-9 pr-10"
        />
        <button
          type="button"
          aria-label="Use my location"
          title={
            geoState === "error"
              ? "Location unavailable"
              : "Find stops near me"
          }
          onClick={handleLocate}
          onMouseDown={(e) => e.preventDefault()}
          disabled={geoState === "loading"}
          className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 transition-colors ${
            geoState === "error"
              ? "text-destructive"
              : geoState === "loading"
                ? "cursor-wait text-muted-foreground"
                : isNearbyMode
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {geoState === "loading" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <LocateFixed className="size-4" />
          )}
        </button>
      </div>
      {open && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1.5 max-h-72 w-full overflow-auto rounded-xl border bg-popover p-1 shadow-lg">
          {isNearbyMode && (
            <li className="px-3 pb-1 pt-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Nearest stops
              </p>
            </li>
          )}
          {suggestions.map((stop) => {
            const Icon = STOP_TYPE_CONFIG[stop.type].Icon;
            return (
              <li key={stop.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(stop)}
                  className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent"
                >
                  <Icon className="size-4 shrink-0 text-muted-foreground" />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium text-foreground">
                      {stop.name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {stop.municipality}
                    </span>
                  </span>
                  <StopTypeBadge type={stop.type} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
