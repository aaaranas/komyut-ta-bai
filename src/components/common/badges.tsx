import type { EventStatus } from "@/core/sensing/types";
import type { StopType } from "@/core/transit/types";
import { STATUS_CONFIG, STOP_TYPE_LABEL } from "@/lib/presentation";
import { cn } from "@/lib/utils";

/** Marks data loaded from a controlled replay scenario, never real reports. */
export function ReplayTag({ className }: { className?: string }) {
  return (
    <span className={cn("rounded border border-dashed border-input px-1 text-[11px] font-semibold text-muted-foreground", className)}>
      Replay
    </span>
  );
}

export function StatusLabel({ status, className }: { status: EventStatus | "withdrawn"; className?: string }) {
  const config = STATUS_CONFIG[status];
  return (
    <span title={config.description} className={cn("inline-flex items-center gap-1 text-xs font-semibold", config.tone, className)}>
      <config.Icon className="size-3.5" />
      {config.label}
    </span>
  );
}

/** Confidence as a thin bar; a design score, not a probability. */
export function ConfidenceBar({ value, className }: { value: number; className?: string }) {
  const percent = Math.round(value * 100);
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 text-xs tabular-nums text-muted-foreground", className)}
      title="Confidence score, not a calibrated probability"
    >
      <span className="h-1 w-10 overflow-hidden rounded-full bg-muted" aria-hidden="true">
        <span className="block h-full bg-foreground" style={{ width: `${percent}%` }} />
      </span>
      {percent}%
    </span>
  );
}

/** "Terminal" or "Port" after a stop name; street stops get nothing. */
export function StopKind({ type }: { type: StopType }) {
  const label = STOP_TYPE_LABEL[type];
  if (!label) return null;
  return <span className="ml-1.5 text-xs font-normal text-muted-foreground">{label}</span>;
}

export function UnverifiedTag({ className }: { className?: string }) {
  return (
    <span
      className={cn("text-[11px] font-semibold text-warn", className)}
      title="Imported without a field check; stops, fares, and times are approximate."
    >
      Unverified
    </span>
  );
}
