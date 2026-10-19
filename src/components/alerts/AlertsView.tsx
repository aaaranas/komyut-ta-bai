"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import EventRow from "@/components/alerts/EventRow";
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
  loading: () => <div className="h-64 w-full rounded-xl bg-muted md:h-full" />,
});

export default function AlertsView() {
  const { snapshot, status, refresh } = useConditions();
  const now = useNow();
  const [filter, setFilter] = useState<ReportCategory | "all">("all");
  const [refreshing, setRefreshing] = useState(false);

  const all = useMemo(() => snapshot?.events ?? [], [snapshot]);
  const events = useMemo(
    () =>
      all
        .filter((event) => filter === "all" || event.category === filter)
        .sort(
          (a, b) =>
            Number(b.status === "corroborated") - Number(a.status === "corroborated") || b.confidence - a.confidence
        ),
    [all, filter]
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
        label: `${eventHeadline(event.category, event.details)}, ${stop.name}`,
        strong: event.status === "corroborated",
      },
    ];
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const countOf = (category: ReportCategory) => all.filter((event) => event.category === category).length;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-16 pt-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[2rem] font-extrabold leading-tight tracking-[-0.025em]">Alerts</h1>
          <p className="mt-1 max-w-prose text-sm text-muted-foreground">
            Verified reports that are changing routes right now.
            {snapshot && ` Updated ${formatAge((now.getTime() - new Date(snapshot.generated_at).getTime()) / 60_000)}.`}{" "}
            <button
              type="button"
              onClick={() => void handleRefresh()}
              disabled={refreshing}
              className="font-medium text-foreground underline underline-offset-4 disabled:opacity-60"
            >
              {refreshing ? "Refreshing" : "Refresh"}
            </button>
          </p>
        </div>
        <Button asChild size="sm" className="shrink-0">
          <Link href="/report">Report</Link>
        </Button>
      </div>

      {snapshot?.storage === "temporary" && (
        <p className="mt-4 border-l-[3px] border-warn pl-3 text-sm">
          Reports on this server are kept in temporary storage and may reset when it restarts.
        </p>
      )}

      <div role="group" aria-label="Filter by type" className="scrollbar-thin -mx-4 mt-6 flex gap-1.5 overflow-x-auto px-4">
        {(["all", ...REPORT_CATEGORIES] as const).map((key) => {
          const active = filter === key;
          const count = key === "all" ? all.length : countOf(key);
          return (
            <button
              key={key}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(key)}
              className={cn(
                "inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm transition-colors",
                active ? "border-foreground bg-foreground text-background" : "border-input hover:bg-accent"
              )}
            >
              {key !== "all" && (
                <span className="size-2 rounded-full" style={{ backgroundColor: CATEGORY_CONFIG[key].hex }} aria-hidden="true" />
              )}
              {key === "all" ? "All" : CATEGORY_CONFIG[key].label}
              <span className={cn("tabular-nums", active ? "text-background/70" : "text-muted-foreground")}>{count}</span>
            </button>
          );
        })}
      </div>

      {status === "loading" ? (
        <p className="mt-8 text-sm text-muted-foreground">Checking conditions…</p>
      ) : status === "unavailable" ? (
        <p className="mt-8 text-sm text-muted-foreground">
          Live conditions can&apos;t be reached right now. Trip plans still work from route data.
        </p>
      ) : (
        <div className="mt-5 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-10">
          <div className="md:order-2">
            <div className="h-64 md:sticky md:top-20 md:h-[calc(100dvh-8rem)]">
              <ConditionsMapCanvas markers={markers} />
            </div>
          </div>
          <div className="mt-4 md:order-1 md:mt-0">
            {events.length === 0 ? (
              <div className="py-6">
                <p className="text-sm font-semibold">Nothing verified right now</p>
                <p className="mt-1 max-w-prose text-sm text-muted-foreground">
                  That means no confirmed reports, not that every road is clear. Seeing a problem?{" "}
                  <Link href="/report" className="font-medium text-foreground underline underline-offset-4">
                    Report it
                  </Link>
                  .
                </p>
              </div>
            ) : (
              <ul className="divide-y border-y">
                {events.map((event) => (
                  <li key={event.id}>
                    <EventRow event={event} />
                  </li>
                ))}
              </ul>
            )}
            {snapshot && <HazardPanel hazards={snapshot.hazards} />}
          </div>
        </div>
      )}
    </main>
  );
}
