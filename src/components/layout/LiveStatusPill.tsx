"use client";

import Link from "next/link";
import { useConditions } from "@/components/providers/ConditionsProvider";
import { cn } from "@/lib/utils";

const STATES = {
  loading: { label: "Connecting", dot: "bg-muted-foreground animate-pulse" },
  live: { label: "Live", dot: "bg-live" },
  stale: { label: "Not updating", dot: "bg-warn" },
  unavailable: { label: "Offline", dot: "bg-warn" },
} as const;

/** Whether live conditions are currently feeding the planner. */
export default function LiveStatusPill() {
  const { status } = useConditions();
  const state = STATES[status];
  return (
    <Link href="/alerts" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
      <span className={cn("size-2 rounded-full", state.dot)} aria-hidden="true" />
      {state.label}
    </Link>
  );
}
