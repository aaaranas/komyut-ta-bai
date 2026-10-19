"use client";

import Link from "next/link";
import { Fragment } from "react";
import { StopKind, UnverifiedTag } from "@/components/common/badges";
import RoutePlate from "@/components/common/RoutePlate";
import { useConditions } from "@/components/providers/ConditionsProvider";
import { useRideTracker } from "@/components/providers/RideTrackerProvider";
import { endOf, type Itinerary, type Leg, type RideLeg, type WalkLeg } from "@/core/planner";
import type { PublicEvent } from "@/core/snapshot";
import { formatPeso } from "@/core/transit/fare";
import { formatClock, formatDuration } from "@/core/transit/time";
import type { Stop } from "@/core/transit/types";
import { useConsent } from "@/hooks/useConsent";
import { CATEGORY_CONFIG, MODE_CONFIG, eventHeadline, routeSubtitle, routeTitle } from "@/lib/presentation";
import { cn } from "@/lib/utils";

const GRID = "grid grid-cols-[4.25rem_1rem_minmax(0,1fr)] gap-x-3";

/** One stretch of the line: solid for vehicles, dotted for walking. */
function Rail({ leg, part }: { leg: Leg | undefined; part: "top" | "bottom" | "full" }) {
  if (!leg) return null;
  const position = part === "top" ? "top-0 h-1/2" : part === "bottom" ? "bottom-0 h-1/2" : "inset-y-0";
  if (leg.kind === "walk") {
    return (
      <span
        className={cn("absolute left-1/2 -translate-x-1/2 border-l-[3px] border-dotted", position)}
        style={{ borderColor: MODE_CONFIG.walk.hex }}
      />
    );
  }
  return (
    <span
      className={cn("absolute left-1/2 w-1 -translate-x-1/2", position)}
      style={{ backgroundColor: MODE_CONFIG[leg.route.mode].hex }}
    />
  );
}

function StopRow({
  stop,
  time,
  before,
  after,
  isDestination = false,
}: {
  stop: Stop;
  time: number;
  before?: Leg;
  after?: Leg;
  isDestination?: boolean;
}) {
  return (
    <li className={cn(GRID, "min-h-10")}>
      <span className="self-center whitespace-nowrap text-right text-[13px] font-semibold tabular-nums">{formatClock(time)}</span>
      <span className="relative flex items-center justify-center">
        <Rail leg={before} part="top" />
        <Rail leg={after} part="bottom" />
        <span
          className={cn(
            "relative size-3.5",
            isDestination ? "rounded-[3px] bg-foreground" : "rounded-full border-[3px] border-foreground bg-background"
          )}
        />
      </span>
      <p className="self-center py-1.5 text-[15px] font-semibold leading-snug">
        {stop.name}
        <StopKind type={stop.type} />
      </p>
    </li>
  );
}

function TripEvents({ ids }: { ids: string[] }) {
  const { eventsById } = useConditions();
  const events = ids.map((id) => eventsById.get(id)).filter((e): e is PublicEvent => !!e);
  if (events.length === 0) return null;
  return (
    <ul className="mt-2 space-y-1">
      {events.map((event) => (
        <li key={event.id} className="flex gap-2 text-sm">
          <span
            className="mt-1.5 size-2 shrink-0 rounded-full"
            style={{ backgroundColor: CATEGORY_CONFIG[event.category].hex }}
            aria-hidden="true"
          />
          <span>
            <span className="font-medium">{eventHeadline(event.category, event.details)}.</span>{" "}
            <span className="text-muted-foreground">{event.consequence}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

const TEXT_ACTION =
  "text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline disabled:opacity-60";

function RideDetails({ leg }: { leg: RideLeg }) {
  const consent = useConsent();
  const tracker = useRideTracker();
  const tracking = tracker.routeId === leg.route.id;
  const stopsCount = leg.stop_ids.length - 1;
  const longWait = leg.wait_mins >= 45;

  return (
    <div className="pb-4 pt-2">
      <Link href={`/routes/${leg.route.id}`} className="group flex items-start gap-2.5">
        <RoutePlate route={leg.route} />
        <span className="min-w-0">
          <span className="block text-[15px] font-medium leading-snug group-hover:underline">{routeTitle(leg.route)}</span>
          <span className="block text-xs text-muted-foreground">
            {routeSubtitle(leg.route)}
          </span>
        </span>
      </Link>
      {leg.route.provenance.status === "unverified" && <UnverifiedTag className="mt-1 block" />}

      <p className="mt-2 text-sm">
        {leg.wait_mins >= 1 && (
          <span className={cn(longWait ? "font-semibold text-warn" : "text-muted-foreground")}>
            {leg.wait_estimated ? "Wait about " : "Wait "}
            {formatDuration(leg.wait_mins)}
            {longWait && !leg.wait_estimated ? " for the next trip" : ""}, board at {formatClock(leg.board_at)}.{" "}
          </span>
        )}
        <span className="text-muted-foreground">
          {stopsCount} stop{stopsCount === 1 ? "" : "s"}, {formatDuration(leg.ride_mins)}, {formatPeso(leg.fare)}
        </span>
      </p>
      {leg.route.service.evidence === "estimate" && (
        <p className="text-xs text-muted-foreground">How often this runs is an estimate.</p>
      )}
      <TripEvents ids={leg.event_ids} />

      <div className="mt-2 flex gap-4">
        <Link
          href={`/report?stop=${encodeURIComponent(leg.from.id)}&route=${encodeURIComponent(leg.route.id)}`}
          className={TEXT_ACTION}
        >
          Report a problem
        </Link>
        {consent.rideTraces && (
          <button type="button" disabled={tracking} onClick={() => tracker.start(leg.route.id)} className={TEXT_ACTION}>
            {tracking ? "Sharing ride time" : "Share ride time"}
          </button>
        )}
      </div>
    </div>
  );
}

function WalkDetails({ leg }: { leg: WalkLeg }) {
  const crossTown = leg.source === "curated" && leg.minutes >= 20;
  return (
    <div className="pb-3 pt-1.5 text-sm text-muted-foreground">
      <p>
        {crossTown ? "Transfer" : "Walk"} {formatDuration(leg.minutes)}
      </p>
      {leg.notes && <p className="mt-0.5 text-xs">{leg.notes}</p>}
      <TripEvents ids={leg.event_ids} />
    </div>
  );
}

/** The trip as a transit line: stops as nodes, each vehicle as a colored stretch. */
export default function LegTimeline({ itinerary }: { itinerary: Itinerary }) {
  const { legs } = itinerary;
  if (legs.length === 0) return null;
  return (
    <ol aria-label="Trip steps">
      <StopRow stop={legs[0].from} time={itinerary.depart_at} after={legs[0]} />
      {legs.map((leg, index) => (
        <Fragment key={`${leg.from.id}-${index}`}>
          <li className={GRID}>
            <span />
            <span className="relative">
              <Rail leg={leg} part="full" />
            </span>
            {leg.kind === "ride" ? <RideDetails leg={leg} /> : <WalkDetails leg={leg} />}
          </li>
          <StopRow
            stop={leg.to}
            time={endOf(leg)}
            before={leg}
            after={legs[index + 1]}
            isDestination={index === legs.length - 1}
          />
        </Fragment>
      ))}
    </ol>
  );
}
