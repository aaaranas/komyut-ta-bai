"use client";

import { MODE_CONFIG } from "@/lib/constants";
import type { Mode } from "@/lib/types";

export type ModeFilter = Mode | "all";

const FILTERS: { value: ModeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "bus", label: MODE_CONFIG.bus.label },
  { value: "vhire", label: MODE_CONFIG.vhire.label },
  { value: "jeepney", label: MODE_CONFIG.jeepney.label },
  { value: "mjeepney", label: MODE_CONFIG.mjeepney.label },
  { value: "ferry", label: MODE_CONFIG.ferry.label },
];

export default function ModeFilterPills({
  value,
  onChange,
}: {
  value: ModeFilter;
  onChange: (filter: ModeFilter) => void;
}) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {FILTERS.map((filter) => (
        <button
          key={filter.value}
          type="button"
          onClick={() => onChange(filter.value)}
          aria-pressed={value === filter.value}
          className={`min-h-11 rounded-full px-4 text-sm font-medium transition ${
            value === filter.value
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
