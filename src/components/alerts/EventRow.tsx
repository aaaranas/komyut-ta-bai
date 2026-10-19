"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { ConfidenceBar, ReplayTag, StatusLabel } from "@/components/common/badges";
import RoutePlate from "@/components/common/RoutePlate";
import { useConditions } from "@/components/providers/ConditionsProvider";
import type { PublicEvent } from "@/core/snapshot";
import { getRoute, getStop } from "@/core/transit/catalog";
import { formatAge, formatDuration } from "@/core/transit/time";
import { useConsent } from "@/hooks/useConsent";
import { useNow } from "@/hooks/useNow";
import { api } from "@/lib/api";
import { currentLocation } from "@/lib/location";
import { CATEGORY_CONFIG, eventHeadline, routeTitle } from "@/lib/presentation";
import { cn } from "@/lib/utils";

const minutesSince = (iso: string, now: Date) => (now.getTime() - new Date(iso).getTime()) / 60_000;

function sourcesText(event: PublicEvent): string {
  const commuters = event.independent_sources - event.official_sources;
  const manual = event.weights.some((w) => w.official_connection === "manual");
  const parts = [];
  if (commuters > 0) parts.push(`${commuters} commuter${commuters === 1 ? "" : "s"}`);
  if (event.official_sources > 0) parts.push(`${event.official_sources} official reading${manual ? " (entered by hand)" : ""}`);
  return parts.join(" and ");
}

/**
 * One published event: what, where, which service, when it was seen, how
 * well supported it is, and what it does to trips.
 *
 * - brief: one line of what and where, for lists of many events
 * - trip: adds the consequence, for a trip plan
 * - full: adds evidence, expiry, and the confirm/clear actions
 */
export default function EventRow({
  event,
  variant = "full",
}: {
  event: PublicEvent;
  variant?: "brief" | "trip" | "full";
}) {
  const now = useNow();
  const config = CATEGORY_CONFIG[event.category];
  const stop = getStop(event.stop_id);
  const route = event.route_id ? getRoute(event.route_id) : undefined;
  const expiresIn = event.expires_at ? (new Date(event.expires_at).getTime() - now.getTime()) / 60_000 : null;

  return (
    <div className="flex gap-3 py-3">
      <span className="mt-1.5 size-2.5 shrink-0 rounded-full" style={{ backgroundColor: config.hex }} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
          <p className="text-sm font-semibold">
            {eventHeadline(event.category, event.details)}
            {event.replay && <ReplayTag className="ml-2 align-middle" />}
          </p>
          {variant === "brief" ? (
            <span className="text-xs tabular-nums text-muted-foreground">
              {formatAge(minutesSince(event.last_observed_at, now))}
            </span>
          ) : (
            <StatusLabel status={event.status} />
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {stop?.name ?? event.stop_id}, {stop?.municipality}
        </p>
        {route && (
          <p className="mt-1 flex items-center gap-2 text-sm">
            <RoutePlate route={route} size="sm" />
            <span className="truncate">{routeTitle(route)}</span>
          </p>
        )}

        {variant !== "brief" && <p className="mt-1.5 text-sm">{event.consequence}</p>}

        {variant === "full" && (
          <>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>
                Seen {formatAge(minutesSince(event.last_observed_at, now))} by {sourcesText(event)}
              </span>
              <ConfidenceBar value={event.confidence} />
            </p>
            {expiresIn !== null && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {event.blocking
                  ? "Stays in effect until someone reports it cleared."
                  : `Fades in about ${formatDuration(Math.max(expiresIn, 1))} unless someone confirms it.`}
              </p>
            )}
            {!event.replay && <EventActions event={event} />}
          </>
        )}
      </div>
    </div>
  );
}

function EventActions({ event }: { event: PublicEvent }) {
  const { refresh } = useConditions();
  const consent = useConsent();
  const [busy, setBusy] = useState<"confirmation" | "clearance" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const send = async (kind: "confirmation" | "clearance") => {
    setBusy(kind);
    setMessage(null);
    try {
      const location = consent.reportLocation === "granted" ? await currentLocation() : null;
      await api.submitReport({
        category: event.category,
        kind,
        stop_id: event.stop_id,
        route_id: event.route_id,
        details: event.details,
        location,
      });
      setMessage(kind === "confirmation" ? "Added your confirmation." : "Marked as cleared by you.");
      await refresh();
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Could not send.");
    } finally {
      setBusy(null);
    }
  };

  const action = "inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-input px-3 text-sm font-medium hover:bg-accent disabled:opacity-60";
  return (
    <div className="mt-2.5">
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy !== null} onClick={() => void send("confirmation")} className={action}>
          {busy === "confirmation" && <Loader2 className="size-3.5 animate-spin" />}
          I see it too
        </button>
        <button type="button" disabled={busy !== null} onClick={() => void send("clearance")} className={cn(action)}>
          {busy === "clearance" && <Loader2 className="size-3.5 animate-spin" />}
          It&apos;s cleared
        </button>
      </div>
      {message && (
        <p className="mt-1.5 text-xs text-muted-foreground" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
