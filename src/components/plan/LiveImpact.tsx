"use client";

import EventRow from "@/components/alerts/EventRow";
import { ForecastTag, OpenMeteoAttribution } from "@/components/common/badges";
import { RAINFALL_LEVEL_LABEL, type RainfallAlert } from "@/core/hazards/rainfall";
import type { ConditionsStatus } from "@/components/providers/ConditionsProvider";
import { useConditions } from "@/components/providers/ConditionsProvider";
import { Segmented } from "@/components/ui/segmented";
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

function Notice({ tone, children }: { tone: "neutral" | "warn" | "ok"; children: React.ReactNode }) {
  return (
    <p
      className={cn(
        "border-l-[3px] py-0.5 pl-3 text-sm",
        tone === "warn" && "border-warn",
        tone === "ok" && "border-live",
        tone === "neutral" && "border-input text-muted-foreground"
      )}
    >
      {children}
    </p>
  );
}

/**
 * How live conditions changed this trip relative to the baseline (route
 * data only). Both estimates stay available.
 */
export default function LiveImpact({ status, baseline, live, usualToday, view, onViewChange }: Props) {
  const { eventsById, snapshot } = useConditions();
  const forecastOf = new Map((snapshot?.weather?.alerts ?? []).map((alert) => [alert.id, alert]));
  const forecastsOn = (ids: string[]) =>
    [...new Set(ids)].map((id) => forecastOf.get(id)).filter((a): a is RainfallAlert => !!a);
  const lookup = (ids: string[]) => ids.map((id) => eventsById.get(id)).filter((e): e is PublicEvent => !!e);

  if (status === "loading") return <Notice tone="neutral">Checking live conditions.</Notice>;
  if (status === "unavailable" || !live) {
    return (
      <Notice tone="warn">
        Live conditions are unavailable, so this estimate uses route data only. Reported delays and flooding are not
        included.
      </Notice>
    );
  }

  const blockedIds = usualToday?.status === "blocked" ? usualToday.event_ids : [];
  if (live.status !== "ok") {
    return (
      <div className="space-y-2">
        <Notice tone="warn">
          Every route we know passes a reported closure. This is the usual route; expect disruption or wait it out.
        </Notice>
        <EventList events={lookup(blockedIds)} />
      </div>
    );
  }

  const enriched = live.itinerary;
  const rerouted = routeSignature(enriched) !== routeSignature(baseline);
  const usualMins = usualToday?.status === "ok" ? usualToday.itinerary.total_mins : null;
  const delta = Math.round(enriched.total_mins - baseline.total_mins);
  const events = lookup([
    ...new Set([
      ...enriched.event_ids,
      ...blockedIds,
      ...(usualToday?.status === "ok" ? usualToday.itinerary.event_ids : []),
    ]),
  ]);

  const forecasts = forecastsOn(enriched.event_ids);

  if (events.length === 0) {
    return (
      <div className="space-y-2">
        <Notice tone="ok">
          No verified problems reported on this trip{status === "stale" ? " (live data is not updating right now)" : ""}.
        </Notice>
        <ForecastNote alerts={forecasts} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <ForecastNote alerts={forecasts} />
      <Notice tone="warn">
        {rerouted
          ? usualMins !== null
            ? `Rerouted around reports. Your usual route would take ${formatDuration(usualMins)} right now.`
            : "Rerouted around reports. Your usual route passes a reported closure."
          : `Reports add about ${formatDuration(Math.max(delta, 0))} to the usual ${formatDuration(baseline.total_mins)}.`}
      </Notice>
      <Segmented
        label="Estimate shown"
        value={view}
        onChange={onViewChange}
        className="flex w-full"
        options={[
          { value: "live", label: `With reports, ${formatDuration(enriched.total_mins)}` },
          { value: "baseline", label: `Usual, ${formatDuration(baseline.total_mins)}` },
        ]}
      />
      <EventList events={events} />
    </div>
  );
}

function EventList({ events }: { events: PublicEvent[] }) {
  if (events.length === 0) return null;
  return (
    <ul className="divide-y border-y">
      {events.map((event) => (
        <li key={event.id}>
          <EventRow event={event} variant="trip" />
        </li>
      ))}
    </ul>
  );
}

function ForecastNote({ alerts }: { alerts: RainfallAlert[] }) {
  if (alerts.length === 0) return null;
  return (
    <div className="border-l-[3px] border-forecast py-0.5 pl-3 text-sm">
      <p>
        {alerts.map((a) => `${RAINFALL_LEVEL_LABEL[a.level]} near ${a.label}`).join("; ")}. Estimate includes a small
        rain allowance. <ForecastTag className="ml-1 align-middle" />
      </p>
      <OpenMeteoAttribution />
    </div>
  );
}
