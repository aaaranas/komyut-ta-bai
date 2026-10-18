"use client";

import { BellRing, Info, Loader2, Megaphone, RefreshCw } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import EventCard from "@/components/alerts/EventCard";
import HazardPanel from "@/components/alerts/HazardPanel";
import { useConditions } from "@/components/providers/ConditionsProvider";
import { Button } from "@/components/ui/button";
import { REPORT_CATEGORIES, type ReportCategory } from "@/core/sensing/types";
import { getStop } from "@/core/transit/catalog";
import { formatAge } from "@/core/transit/time";
import { useNow } from "@/hooks/useNow";
import { CATEGORY_CONFIG, eventHeadline } from "@/lib/presentation";
import { cn } from "@/lib/utils";

const ConditionsMapCanvas = dynamic(() => import("@/components/alerts/ConditionsMapCanvas"), {
  ssr: false,
  loading: () => <div className="h-64 w-full animate-pulse rounded-2xl border bg-muted sm:h-80" />,
});

export default function AlertsView() {
  const { snapshot, status, refresh } = useConditions();
  const now = useNow();
  const [filter, setFilter] = useState<ReportCategory | "all">("all");
  const [refreshing, setRefreshing] = useState(false);

  const events = useMemo(
    () =>
      (snapshot?.events ?? [])
        .filter((event) => filter === "all" || event.category === filter)
        .sort((a, b) => Number(b.status === "corroborated") - Number(a.status === "corroborated") || b.confidence - a.confidence),
    [snapshot, filter]
  );

  const markers = events.flatMap((event) => {
    const stop = getStop(event.stop_id);
    if (!stop) return [];
    return [
      {
        id: event.id,
        lng: stop.lng,
        lat: stop.lat,
        color: CATEGORY_CONFIG[event.category].hex,
        label: `${eventHeadline(event.category, event.details)} — ${stop.name}`,
        strong: event.status === "corroborated",
      },
    ];
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-12 pt-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            <BellRing className="size-6 text-primary" />
            Live conditions
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Verified commuter reports and official readings that are changing route recommendations.
            {snapshot && ` Updated ${formatAge((now.getTime() - new Date(snapshot.generated_at).getTime()) / 60_000)}.`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void handleRefresh()} disabled={refreshing}>
            <RefreshCw className={cn("size-4", refreshing && "animate-spin")} />
            Refresh
          </Button>
          <Button asChild size="sm">
            <Link href="/report">
              <Megaphone className="size-4" />
              Report
            </Link>
          </Button>
        </div>
      </div>

      {snapshot?.storage === "temporary" && (
        <p className="mt-4 flex gap-2 rounded-xl border border-amber-300/60 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          This deployment keeps reports in temporary storage; they may reset when the server restarts.
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {(["all", ...REPORT_CATEGORIES] as const).map((key) => {
          const active = filter === key;
          const label = key === "all" ? "All" : CATEGORY_CONFIG[key].label;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(key)}
              className={cn(
                "min-h-9 rounded-full border px-3.5 text-sm font-medium transition-colors",
                active ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-accent"
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {status === "loading" ? (
        <p className="mt-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading live conditions…
        </p>
      ) : status === "unavailable" ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Live conditions can&apos;t be reached right now. Trip plans still work from the baseline dataset.
        </p>
      ) : (
        <div className="mt-5 lg:grid lg:grid-cols-[1fr_1.1fr] lg:items-start lg:gap-6">
          <div className="lg:sticky lg:top-20">
            <ConditionsMapCanvas markers={markers} />
          </div>
          <div className="mt-4 lg:mt-0">
            {events.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-6 text-center">
                <p className="text-sm font-semibold text-foreground">No verified disruptions right now</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  An empty feed means nothing verified has been reported — not that every road is clear.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {events.map((event) => (
                  <li key={event.id}>
                    <EventCard event={event} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {snapshot && <HazardPanel hazards={snapshot.hazards} />}
    </main>
  );
}
