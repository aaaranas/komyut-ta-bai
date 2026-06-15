"use client";

import { LayoutGrid } from "lucide-react";
import type { ComponentType } from "react";
import { MODE_CONFIG } from "@/lib/constants";
import type { Mode } from "@/lib/types";
import { cn } from "@/lib/utils";

export type ModeFilter = Mode | "all";

const FILTERS: {
  value: ModeFilter;
  label: string;
  Icon: ComponentType<{ className?: string }>;
}[] = [
  { value: "all", label: "All", Icon: LayoutGrid },
  { value: "bus", label: MODE_CONFIG.bus.label, Icon: MODE_CONFIG.bus.Icon },
  {
    value: "mybus",
    label: MODE_CONFIG.mybus.label,
    Icon: MODE_CONFIG.mybus.Icon,
  },
  {
    value: "vhire",
    label: MODE_CONFIG.vhire.label,
    Icon: MODE_CONFIG.vhire.Icon,
  },
  {
    value: "jeepney",
    label: MODE_CONFIG.jeepney.label,
    Icon: MODE_CONFIG.jeepney.Icon,
  },
  {
    value: "mjeepney",
    label: MODE_CONFIG.mjeepney.label,
    Icon: MODE_CONFIG.mjeepney.Icon,
  },
  {
    value: "ferry",
    label: MODE_CONFIG.ferry.label,
    Icon: MODE_CONFIG.ferry.Icon,
  },
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
