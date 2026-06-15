"use client";

import { Search } from "lucide-react";
import { useId, useMemo, useRef, useState } from "react";
import StopTypeBadge from "@/components/StopTypeBadge";
import { Input } from "@/components/ui/input";
import { stops } from "@/lib/catalog";
import { HUB_STOP_TYPES, STOP_TYPE_CONFIG } from "@/lib/constants";
import type { Stop } from "@/lib/types";

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
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const suggestions = useMemo(() => matchStops(query), [query]);

  const handleInputChange = (text: string) => {
    onChange(null);
    setQuery(text);
    setOpen(true);
  };

  const handleFocus = () => {
    if (blurTimeout.current) clearTimeout(blurTimeout.current);
    setOpen(true);
  };

  const handleBlur = () => {
    // Delay so a tap on a suggestion lands before the list closes.
    blurTimeout.current = setTimeout(() => setOpen(false), 150);
  };

  const handleSelect = (stop: Stop) => {
    onChange(stop);
    setQuery("");
    setOpen(false);
  };

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
          className="pl-9"
        />
      </div>
      {open && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1.5 max-h-72 w-full overflow-auto rounded-xl border bg-popover p-1 shadow-lg">
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
