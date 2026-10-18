"use client";

import { Hourglass, LocateFixed, Megaphone } from "lucide-react";
import Link from "next/link";
import { ReplayBadge } from "@/components/common/badges";
import StopTypeBadge from "@/components/common/StopTypeBadge";
import UnverifiedBadge from "@/components/common/UnverifiedBadge";
import { useConditions } from "@/components/providers/ConditionsProvider";
import { useRideTracker } from "@/components/providers/RideTrackerProvider";
import type { Itinerary, Leg, RideLeg, WalkLeg } from "@/core/planner";
import type { PublicEvent } from "@/core/snapshot";
import { formatPeso } from "@/core/transit/fare";
import { formatClock, formatDuration } from "@/core/transit/time";
import { useConsent } from "@/hooks/useConsent";
import { CATEGORY_CONFIG, MODE_CONFIG, eventHeadline } from "@/lib/presentation";

function EventChips({ ids }: { ids: string[] }) {
  const { eventsById } = useConditions();
  const events = ids.map((id) => eventsById.get(id)).filter((e): e is PublicEvent => !!e);
  if (events.length === 0) return null;
  return (
    <ul className="mt-2 flex flex-wrap gap-1.5">
      {events.map((event) => {
        const config = CATEGORY_CONFIG[event.category];
        return (
          <li
            key={event.id}
            className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium ${config.tone}`}
          >
            <config.Icon className="size-3" />
            {eventHeadline(event.category, event.details)}
            {event.replay && <ReplayBadge className="ml-1" />}
          </li>
        );
      })}
    </ul>
  );
}

function WalkDetails({ leg }: { leg: WalkLeg }) {
  const crossTown = leg.source === "curated" && leg.minutes >= 20;
  return (
    <>
      <p className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-foreground">
        {crossTown ? "Transfer to" : "Walk to"} <span className="font-semibold">{leg.to.name}</span>
        <StopTypeBadge type={leg.to.type} />
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {formatClock(leg.start_at)} · {formatDuration(leg.minutes)}
        {leg.notes ? ` · ${leg.notes}` : ""}
      </p>
      <EventChips ids={leg.event_ids} />
    </>
  );
}

function RideDetails({ leg }: { leg: RideLeg }) {
  const config = MODE_CONFIG[leg.route.mode];
  const consent = useConsent();
  const tracker = useRideTracker();
  const tracking = tracker.routeId === leg.route.id;
  const longWait = leg.wait_mins >= 45;
  const headwayEstimated = leg.route.service.evidence === "estimate";

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${config.badge}`}>
          {config.label}
        </span>
        <Link href={`/routes/${leg.route.id}`} className="text-sm font-semibold text-foreground hover:underline">
          {leg.route.name}
        </Link>
        {leg.route.provenance.status === "unverified" && <UnverifiedBadge />}
      </div>

      <p className="mt-2 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        Board at <span className="font-medium text-foreground">{leg.from.name}</span>
        <StopTypeBadge type={leg.from.type} />
        <span className="tabular-nums">· {formatClock(leg.board_at)}</span>
      </p>
      {leg.wait_mins >= 1 && (
        <p className={`mt-0.5 flex items-center gap-1 text-xs ${longWait ? "font-medium text-amber-700 dark:text-amber-300" : "text-muted-foreground"}`}>
          <Hourglass className="size-3" />
          {leg.wait_estimated ? "About " : ""}
          {formatDuration(leg.wait_mins)} wait
          {longWait && !leg.wait_estimated ? " — next service" : ""}
          {headwayEstimated ? " (headway is an estimate)" : ""}
        </p>
      )}
      <p className="mt-1 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        Alight at <span className="font-medium text-foreground">{leg.to.name}</span>
        <StopTypeBadge type={leg.to.type} />
        <span className="tabular-nums">· {formatClock(leg.alight_at)}</span>
      </p>
      <p className="mt-1 text-xs font-medium text-muted-foreground">
        {formatPeso(leg.fare)} · {formatDuration(leg.ride_mins)} · {leg.stop_ids.length - 1} stop
        {leg.stop_ids.length === 2 ? "" : "s"}
      </p>
      <EventChips ids={leg.event_ids} />

      <div className="mt-2 flex flex-wrap gap-2">
        <Link
          href={`/report?stop=${encodeURIComponent(leg.from.id)}&route=${encodeURIComponent(leg.route.id)}`}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium text-foreground hover:bg-accent"
        >
          <Megaphone className="size-3.5" />
          Report a problem
        </Link>
        {consent.rideTraces && (
          <button
            type="button"
            disabled={tracking}
            onClick={() => tracker.start(leg.route.id)}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium text-foreground hover:bg-accent disabled:opacity-60"
          >
            <LocateFixed className="size-3.5" />
            {tracking ? "Sharing ride time…" : "Share ride time"}
          </button>
        )}
      </div>
    </>
  );
}

function LegRow({ leg }: { leg: Leg }) {
  const config = MODE_CONFIG[leg.kind === "ride" ? leg.route.mode : "walk"];
  return (
    <li className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`grid size-11 shrink-0 place-items-center rounded-full text-white ${config.dot}`}>
          <config.Icon className="size-5" />
        </div>
        <div className="w-0.5 flex-1 bg-border" />
      </div>
      <div className="min-w-0 flex-1 pb-8">{leg.kind === "walk" ? <WalkDetails leg={leg} /> : <RideDetails leg={leg} />}</div>
    </li>
  );
}

export default function LegTimeline({ itinerary }: { itinerary: Itinerary }) {
  return (
    <>
      {itinerary.legs.map((leg, index) => (
        <LegRow key={`${leg.from.id}-${index}`} leg={leg} />
      ))}
    </>
  );
}
