"use client";

import { Activity, CircleCheck } from "lucide-react";
import EventCard from "@/components/alerts/EventCard";
import { useConditions } from "@/components/providers/ConditionsProvider";
import { getStop } from "@/core/transit/catalog";
import { formatDuration } from "@/core/transit/time";
import type { Route } from "@/core/transit/types";
import { hopMinutes } from "@/core/planner";

/**
 * Live layer for one route: published events at its stops that apply to it,
 * and aggregated travel times observed by riders who shared ride traces.
 */
export default function RouteLiveStatus({ route }: { route: Route }) {
  const { snapshot, status } = useConditions();
  if (!snapshot) {
    return status === "loading" ? null : (
      <p className="mt-6 text-xs text-muted-foreground">Live conditions are unavailable right now.</p>
    );
  }

  const stops = new Set(route.stop_ids);
  const events = snapshot.events.filter(
    (event) => stops.has(event.stop_id) && (event.route_id === null || event.route_id === route.id)
  );
  const observed = snapshot.travel_times.filter((aggregate) => aggregate.route_id === route.id);

  return (
    <section className="mt-6">
      <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
        <Activity className="size-4 text-primary" />
        Live on this route
      </h2>
      {events.length === 0 ? (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <CircleCheck className="size-4 text-emerald-600" />
          No verified disruptions reported at its stops.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {events.map((event) => (
            <li key={event.id}>
              <EventCard event={event} compact />
            </li>
          ))}
        </ul>
      )}

      {observed.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-xl border">
          <p className="border-b bg-muted/50 px-3 py-2 text-xs font-semibold text-muted-foreground">
            Observed ride times (last 2 h, median of shared rides)
          </p>
          {observed.map((aggregate) => {
            const baseline = hopMinutes(route.id, aggregate.from_stop_id, aggregate.to_stop_id);
            return (
              <div
                key={`${aggregate.from_stop_id}-${aggregate.to_stop_id}`}
                className="flex items-center justify-between gap-3 border-b px-3 py-2 text-sm last:border-b-0"
              >
                <span className="min-w-0 truncate">
                  {getStop(aggregate.from_stop_id)?.name} → {getStop(aggregate.to_stop_id)?.name}
                </span>
                <span className="shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                  <strong className="text-sm text-foreground">{formatDuration(aggregate.median_mins)}</strong>
                  {baseline !== undefined && ` vs ${formatDuration(baseline)} usual`} · {aggregate.samples} rides
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
