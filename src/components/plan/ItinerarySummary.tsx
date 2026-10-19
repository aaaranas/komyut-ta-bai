"use client";

import { useState } from "react";
import RoutePlate from "@/components/common/RoutePlate";
import ShareTripButton from "@/components/plan/ShareTripButton";
import type { Itinerary } from "@/core/planner";
import { formatPeso } from "@/core/transit/fare";
import { formatClock, formatDuration } from "@/core/transit/time";
import type { Stop } from "@/core/transit/types";
import { routeTitle } from "@/lib/presentation";

interface Props {
  itinerary: Itinerary;
  origin: Stop;
  destination: Stop;
}

/** The two numbers a commuter decides on, then the vehicles in order. */
export default function ItinerarySummary({ itinerary, origin, destination }: Props) {
  const [showFares, setShowFares] = useState(false);
  const breakdown = [
    `${formatDuration(itinerary.riding_mins)} riding`,
    itinerary.waiting_mins >= 1 && `${formatDuration(itinerary.waiting_mins)} waiting`,
    itinerary.walking_mins >= 1 && `${formatDuration(itinerary.walking_mins)} walking`,
  ].filter(Boolean);
  const rides = itinerary.legs.filter((leg) => leg.kind === "ride");

  return (
    <section aria-label="Trip summary">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-[2.5rem] font-extrabold leading-none tracking-[-0.03em] tabular-nums">
            {formatDuration(itinerary.total_mins)}
          </p>
          <p className="mt-2 text-sm tabular-nums text-muted-foreground">
            {formatClock(itinerary.depart_at)} to {formatClock(itinerary.arrive_at)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-extrabold leading-none tabular-nums">{formatPeso(itinerary.fare)}</p>
          <p className="mt-2 text-sm tabular-nums text-muted-foreground">{formatPeso(itinerary.discounted_fare)} discounted</p>
        </div>
      </div>

      <ol className="mt-4 flex flex-wrap items-center gap-y-2" aria-label="Vehicles in order">
        {rides.map((leg, index) =>
          leg.kind === "ride" ? (
            <li key={index} className="flex items-center">
              {index > 0 && <span className="mx-1.5 h-0.5 w-3 rounded-full bg-input" aria-hidden="true" />}
              <RoutePlate route={leg.route} size="sm" />
            </li>
          ) : null
        )}
      </ol>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm">
        <p className="text-muted-foreground">{breakdown.join(", ")}</p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setShowFares((open) => !open)}
            aria-expanded={showFares}
            className="font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {showFares ? "Hide fares" : "Fares"}
          </button>
          <ShareTripButton origin={origin} destination={destination} itinerary={itinerary} />
        </div>
      </div>

      {showFares && (
        <dl className="mt-3 divide-y border-y text-sm">
          {rides.map((leg, index) =>
            leg.kind === "ride" ? (
              <div key={index} className="flex items-center justify-between gap-3 py-2">
                <dt className="flex min-w-0 items-center gap-2">
                  <RoutePlate route={leg.route} size="sm" />
                  <span className="truncate">{routeTitle(leg.route)}</span>
                </dt>
                <dd className="tabular-nums">{formatPeso(leg.fare)}</dd>
              </div>
            ) : null
          )}
          <div className="flex justify-between py-2 font-semibold">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatPeso(itinerary.fare)}</dd>
          </div>
        </dl>
      )}
    </section>
  );
}
