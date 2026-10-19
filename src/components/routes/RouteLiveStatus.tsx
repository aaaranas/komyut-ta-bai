"use client";

import EventRow from "@/components/alerts/EventRow";
import { useConditions } from "@/components/providers/ConditionsProvider";
import { hopMinutes } from "@/core/planner";
import { getStop } from "@/core/transit/catalog";
import { formatDuration } from "@/core/transit/time";
import type { Route } from "@/core/transit/types";

/**
 * Live layer for one route: published events at its stops that apply to it,
 * and travel times observed by riders who shared their ride.
 */
export default function RouteLiveStatus({ route }: { route: Route }) {
  const { snapshot, status } = useConditions();
  if (!snapshot) {
    return status === "loading" ? null : (
      <p className="mt-8 text-sm text-muted-foreground">Live conditions are unavailable right now.</p>
    );
  }

  const stops = new Set(route.stop_ids);
  const events = snapshot.events.filter(
    (event) => stops.has(event.stop_id) && (event.route_id === null || event.route_id === route.id)
  );
  const observed = snapshot.travel_times.filter((aggregate) => aggregate.route_id === route.id);

  return (
    <section className="mt-8" aria-labelledby="live">
      <h2 id="live" className="text-base font-bold">
        Live on this route
      </h2>
      {events.length === 0 ? (
        <p className="mt-1 text-sm text-muted-foreground">No verified reports at its stops.</p>
      ) : (
        <ul className="mt-1 divide-y border-y">
          {events.map((event) => (
            <li key={event.id}>
              <EventRow event={event} variant="trip" />
            </li>
          ))}
        </ul>
      )}

      {observed.length > 0 && (
        <table className="mt-4 w-full border-y text-sm">
          <caption className="pb-1 text-left text-xs text-muted-foreground">
            Ride times from riders who shared them, last 2 hours (median)
          </caption>
          <tbody className="divide-y">
            {observed.map((aggregate) => {
              const usual = hopMinutes(route.id, aggregate.from_stop_id, aggregate.to_stop_id);
              return (
                <tr key={`${aggregate.from_stop_id}-${aggregate.to_stop_id}`}>
                  <td className="py-2 pr-3">
                    {getStop(aggregate.from_stop_id)?.name} to {getStop(aggregate.to_stop_id)?.name}
                  </td>
                  <td className="py-2 text-right tabular-nums">
                    <span className="font-semibold">{formatDuration(aggregate.median_mins)}</span>
                    <span className="text-muted-foreground">
                      {usual !== undefined && `, usually ${formatDuration(usual)}`}, {aggregate.samples} rides
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}
