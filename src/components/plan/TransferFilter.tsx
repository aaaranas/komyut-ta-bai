"use client";

import { Filter } from "lucide-react";

export type MaxTransfers = "any" | "1" | "0";

const OPTIONS: { value: MaxTransfers; label: string }[] = [
  { value: "any", label: "Any" },
  { value: "1", label: "≤ 1 transfer" },
  { value: "0", label: "Direct" },
];

export default function TransferFilter({
  value,
  onChange,
}: {
  value: MaxTransfers;
  onChange: (v: MaxTransfers) => void;
}) {
  return (
    <div className="mt-3 flex items-center gap-2">
      <Filter className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">Transfers:</span>
      <div className="flex gap-1">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              value === opt.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
