"use client";

import { CircleCheck, Info, Route, TriangleAlert, WifiOff } from "lucide-react";
import EventCard from "@/components/alerts/EventCard";
import type { ConditionsStatus } from "@/components/providers/ConditionsProvider";
import { useConditions } from "@/components/providers/ConditionsProvider";
import type { Itinerary, PlanOutcome, RetimeOutcome } from "@/core/planner";
import type { PublicEvent } from "@/core/snapshot";
import { formatDuration } from "@/core/transit/time";
import { cn } from "@/lib/utils";

export type PlanView = "live" | "baseline";

interface Props {
  status: ConditionsStatus;
  baseline: Itinerary;
  live: PlanOutcome | null;
  usualToday: RetimeOutcome | null;
  view: PlanView;
  onViewChange: (view: PlanView) => void;
}

const routeSignature = (itinerary: Itinerary) =>
  itinerary.legs.map((leg) => (leg.kind === "ride" ? leg.route.id : "walk")).join(">");

function Banner({ tone, Icon, children }: { tone: "info" | "warn" | "ok"; Icon: typeof Info; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "mt-4 flex gap-3 rounded-xl border px-4 py-3 text-sm",
        tone === "warn" && "border-amber-300/60 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100",
        tone === "ok" && "border-emerald-300/60 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100",
        tone === "info" && "bg-muted/60 text-foreground"
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

/**
 * Explains how live conditions changed this trip relative to the baseline
 * (curated data only), and keeps both estimates available side by side.
 */
export default function LiveImpact({ status, baseline, live, usualToday, view, onViewChange }: Props) {
  const { eventsById } = useConditions();

  if (status === "loading") {
    return <Banner tone="info" Icon={Info}>Checking live conditions… showing the baseline estimate for now.</Banner>;
  }
  if (status === "unavailable" || !live) {
    return (
      <Banner tone="warn" Icon={WifiOff}>
        Live conditions are unavailable, so this is the <strong>baseline estimate</strong> from curated route data
        only. Reports of delays or flooding are not reflected.
      </Banner>
    );
  }

  const blockedIds = usualToday?.status === "blocked" ? usualToday.event_ids : [];
  if (live.status !== "ok") {
    const events = blockedIds.map((id) => eventsById.get(id)).filter((e): e is PublicEvent => !!e);
    return (
      <>
        <Banner tone="warn" Icon={TriangleAlert}>
          Every route we know passes a reported closure. Showing the usual route — expect disruption or wait it out.
        </Banner>
        <EventList events={events} />
      </>
    );
  }

  const enriched = live.itinerary;
  const rerouted = routeSignature(enriched) !== routeSignature(baseline);
  const usualMins = usualToday?.status === "ok" ? usualToday.itinerary.total_mins : null;
  const delta = Math.round(enriched.total_mins - baseline.total_mins);
  const relevantIds = new Set([...enriched.event_ids, ...blockedIds, ...(usualToday?.status === "ok" ? usualToday.itinerary.event_ids : [])]);
  const events = [...relevantIds].map((id) => eventsById.get(id)).filter((e): e is PublicEvent => !!e);

  return (
    <>
      {events.length === 0 ? (
        <Banner tone="ok" Icon={CircleCheck}>
          No verified disruptions on this trip{status === "stale" ? " (live data is not updating right now)" : ""}.
        </Banner>
      ) : rerouted ? (
        <Banner tone="warn" Icon={Route}>
          <strong>Rerouted around reported conditions.</strong>{" "}
          {usualMins !== null
            ? `Your usual route would take about ${formatDuration(usualMins)} right now (normally ${formatDuration(baseline.total_mins)}).`
            : "Your usual route passes a reported closure."}
        </Banner>
      ) : (
        <Banner tone="warn" Icon={TriangleAlert}>
          Live conditions add about <strong>{formatDuration(Math.max(delta, 0))}</strong> to the baseline estimate of{" "}
          {formatDuration(baseline.total_mins)}.
        </Banner>
      )}

      {events.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1" role="group" aria-label="Estimate shown">
          {(
            [
              ["live", "With live conditions", enriched.total_mins],
              ["baseline", "Baseline (usual)", baseline.total_mins],
            ] as const
          ).map(([value, label, minutes]) => (
            <button
              key={value}
              type="button"
              aria-pressed={view === value}
              onClick={() => onViewChange(value)}
              className={cn(
                "flex min-h-11 flex-col items-center justify-center rounded-md px-2 text-xs font-medium transition-colors",
                view === value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              {label}
              <span className="text-sm font-bold tabular-nums">{formatDuration(minutes)}</span>
            </button>
          ))}
        </div>
      )}
      <EventList events={events} />
    </>
  );
}

function EventList({ events }: { events: PublicEvent[] }) {
  if (events.length === 0) return null;
  return (
    <ul className="mt-3 space-y-2">
      {events.map((event) => (
        <li key={event.id}>
          <EventCard event={event} compact />
        </li>
      ))}
    </ul>
  );
}
