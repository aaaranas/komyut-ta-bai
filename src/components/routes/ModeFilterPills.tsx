"use client";

import { LayoutGrid } from "lucide-react";
import type { Mode } from "@/core/transit/types";
import { MODE_CONFIG, MODE_ORDER } from "@/lib/presentation";
import { cn } from "@/lib/utils";

export type ModeFilter = Mode | "all";

const FILTERS = [
  { value: "all" as ModeFilter, label: "All", Icon: LayoutGrid },
  ...MODE_ORDER.map((mode) => ({ value: mode as ModeFilter, label: MODE_CONFIG[mode].label, Icon: MODE_CONFIG[mode].Icon })),
];

export default function ModeFilterPills({
  value,
  onChange,
}: {
  value: ModeFilter;
  onChange: (filter: ModeFilter) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((filter) => {
        const active = value === filter.value;
        return (
          <button
            key={filter.value}
            type="button"
            onClick={() => onChange(filter.value)}
            aria-pressed={active}
            className={cn(
              "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <filter.Icon className="size-3.5" />
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
