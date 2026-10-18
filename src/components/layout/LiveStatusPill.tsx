"use client";

import { Loader2, Radio, WifiOff } from "lucide-react";
import Link from "next/link";
import { useConditions } from "@/components/providers/ConditionsProvider";
import { cn } from "@/lib/utils";

/** Compact indicator of whether live conditions are currently feeding the planner. */
export default function LiveStatusPill() {
  const { status } = useConditions();
  const config = {
    loading: { label: "Connecting", Icon: Loader2, tone: "text-muted-foreground", spin: true },
    live: { label: "Live", Icon: Radio, tone: "text-emerald-700 dark:text-emerald-300", spin: false },
    stale: { label: "Not updating", Icon: WifiOff, tone: "text-amber-700 dark:text-amber-300", spin: false },
    unavailable: { label: "Baseline only", Icon: WifiOff, tone: "text-amber-700 dark:text-amber-300", spin: false },
  }[status];
  return (
    <Link
      href="/alerts"
      title="Live conditions status"
      className={cn(
        "inline-flex min-h-9 items-center gap-1.5 rounded-full border bg-card px-2.5 text-xs font-medium",
        config.tone
      )}
    >
      <config.Icon className={cn("size-3.5", config.spin && "animate-spin")} />
      <span className="hidden min-[380px]:inline">{config.label}</span>
    </Link>
  );
}
