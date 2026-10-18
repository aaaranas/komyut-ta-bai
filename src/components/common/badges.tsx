import { FlaskConical } from "lucide-react";
import type { EventStatus } from "@/core/sensing/types";
import { STATUS_CONFIG } from "@/lib/presentation";
import { cn } from "@/lib/utils";

/** Marks data loaded from a controlled replay scenario, never real reports. */
export function ReplayBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-fuchsia-500/12 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-fuchsia-700 dark:text-fuchsia-300",
        className
      )}
    >
      <FlaskConical className="size-3" />
      Replay
    </span>
  );
}

export function StatusBadge({ status, className }: { status: EventStatus | "withdrawn"; className?: string }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      title={config.description}
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold",
        config.tone,
        className
      )}
    >
      <config.Icon className="size-3.5" />
      {config.label}
    </span>
  );
}

/** Confidence as a short bar plus a percentage; a design score, not a probability. */
export function ConfidenceMeter({ value, className }: { value: number; className?: string }) {
  const percent = Math.round(value * 100);
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs text-muted-foreground", className)}>
      <span className="h-1.5 w-14 overflow-hidden rounded-full bg-muted" aria-hidden="true">
        <span className="block h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
      </span>
      <span className="tabular-nums" title="Confidence score (not a calibrated probability)">
        {percent}%
      </span>
    </span>
  );
}
