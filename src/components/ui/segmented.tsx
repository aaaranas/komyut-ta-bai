"use client";

import { cn } from "@/lib/utils";

/** A small set of mutually exclusive options, e.g. Fastest / Cheapest. */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
  className,
}: {
  value: T;
  options: { value: T; label: React.ReactNode }[];
  onChange: (value: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <div role="group" aria-label={label} className={cn("inline-flex rounded-lg bg-muted p-0.5", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "min-h-9 flex-1 whitespace-nowrap rounded-md px-3.5 text-sm font-medium transition-colors",
            value === option.value
              ? "bg-background text-foreground shadow-[0_1px_2px_rgb(0_0_0/0.08)]"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
