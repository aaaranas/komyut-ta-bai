"use client";

import { ArrowRight, BellRing, Megaphone } from "lucide-react";
import Link from "next/link";
import { useConditions } from "@/components/providers/ConditionsProvider";
import { getStop } from "@/core/transit/catalog";
import { CATEGORY_CONFIG, eventHeadline } from "@/lib/presentation";
import { cn } from "@/lib/utils";

/** Summary of verified conditions plus the report entry point. */
export default function LiveConditionsStrip() {
  const { snapshot, status } = useConditions();
  const events = snapshot?.events ?? [];
  const confirmed = events.filter((event) => event.status === "corroborated").length;
  const top = [...events].sort((a, b) => b.confidence - a.confidence).slice(0, 2);

  return (
    <div className="mt-6 space-y-3">
      <Link href="/alerts" className="block rounded-xl border bg-card p-4 transition-colors hover:bg-accent">
        <span className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
              <BellRing className="size-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-foreground">Live conditions</span>
              <span className="block text-xs text-muted-foreground">
                {status === "loading"
                  ? "Checking…"
                  : status === "unavailable"
                    ? "Unavailable — plans use the baseline dataset"
                    : events.length === 0
                      ? "No verified disruptions reported"
                      : `${events.length} active · ${confirmed} confirmed`}
              </span>
            </span>
          </span>
          <ArrowRight className="size-4 text-muted-foreground" />
        </span>
        {top.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {top.map((event) => {
              const config = CATEGORY_CONFIG[event.category];
              return (
                <li key={event.id} className={cn("flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs", config.tone)}>
                  <config.Icon className="size-3.5 shrink-0" />
                  <span className="truncate font-medium">{eventHeadline(event.category, event.details)}</span>
                  <span className="truncate opacity-75">· {getStop(event.stop_id)?.name}</span>
                </li>
              );
            })}
          </ul>
        )}
      </Link>

      <Link
        href="/report"
        className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-4 transition-colors hover:bg-primary/10"
      >
        <span className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Megaphone className="size-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-foreground">Report what you see</span>
            <span className="block text-xs text-muted-foreground">Delay, flooding, full vehicle, or road problem — a few taps</span>
          </span>
        </span>
        <ArrowRight className="size-4 text-muted-foreground" />
      </Link>
    </div>
  );
}
