"use client";

import { useId, useMemo, useRef, useState } from "react";
import { stops } from "@/lib/catalog";
import type { Stop } from "@/lib/types";

function matchStops(query: string): Stop[] {
  const needle = query.trim().toLowerCase();
  if (needle === "") return stops;
  return stops.filter(
    (stop) =>
      stop.name.toLowerCase().includes(needle) ||
      stop.municipality.toLowerCase().includes(needle)
  );
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
        className="mb-1 block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      <input
        id={id}
        type="text"
        autoComplete="off"
        placeholder={placeholder}
        value={value ? value.name : query}
        onChange={(event) => handleInputChange(event.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-base text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg">
          {suggestions.map((stop) => (
            <li key={stop.id}>
              <button
                type="button"
                onClick={() => handleSelect(stop)}
                className="flex min-h-11 w-full flex-col px-4 py-2 text-left hover:bg-primary-light"
              >
                <span className="text-sm font-medium text-gray-900">
                  {stop.name}
                </span>
                <span className="text-xs text-gray-500">
                  {stop.municipality}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
