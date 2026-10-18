"use client";

import { Filter } from "lucide-react";
import { cn } from "@/lib/utils";

/** Maximum vehicles boarded: any, at most one transfer, or direct. */
export type RideLimit = "any" | "2" | "1";

const OPTIONS: { value: RideLimit; label: string }[] = [
  { value: "any", label: "Any" },
  { value: "2", label: "≤ 1 transfer" },
  { value: "1", label: "Direct" },
];

export default function RideLimitFilter({
  value,
  onChange,
}: {
  value: RideLimit;
  onChange: (value: RideLimit) => void;
}) {
  return (
    <div className="mt-3 flex items-center gap-2">
      <Filter className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">Transfers:</span>
      <div className="flex gap-1">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "min-h-8 rounded-full px-3 text-xs font-medium transition-colors",
              value === option.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
