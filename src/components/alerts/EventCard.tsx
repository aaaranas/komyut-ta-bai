"use client";

import { Building2, CircleCheck, Eye, Loader2, Users } from "lucide-react";
import { useState } from "react";
import { ConfidenceMeter, ReplayBadge, StatusBadge } from "@/components/common/badges";
import { useConditions } from "@/components/providers/ConditionsProvider";
import type { PublicEvent } from "@/core/snapshot";
import { getRoute, getStop } from "@/core/transit/catalog";
import { formatAge, formatDuration } from "@/core/transit/time";
import { useConsent } from "@/hooks/useConsent";
import { useNow } from "@/hooks/useNow";
import { api } from "@/lib/api";
import { currentLocation } from "@/lib/location";
import { CATEGORY_CONFIG, eventHeadline } from "@/lib/presentation";
import { cn } from "@/lib/utils";

const minutesUntil = (iso: string, now: Date) => (new Date(iso).getTime() - now.getTime()) / 60_000;
const minutesSince = (iso: string, now: Date) => (now.getTime() - new Date(iso).getTime()) / 60_000;

/**
 * One published event: what, where, which service, when it was observed,
 * how well supported it is, and what it means for trips.
 */
export default function EventCard({ event, compact = false }: { event: PublicEvent; compact?: boolean }) {
  const now = useNow();
  const config = CATEGORY_CONFIG[event.category];
  const stop = getStop(event.stop_id);
  const route = event.route_id ? getRoute(event.route_id) : undefined;
  const commuterSources = event.independent_sources - event.official_sources;
  const manualOfficial = event.weights.some((w) => w.official_connection === "manual");
  const expiresIn = event.expires_at ? minutesUntil(event.expires_at, now) : null;

  return (
    <article className={cn("rounded-xl border bg-card p-3.5", compact && "p-3")}>
      <div className="flex items-start gap-3">
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg", config.solid)}>
          <config.Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="text-sm font-semibold text-foreground">{eventHeadline(event.category, event.details)}</h3>
            <StatusBadge status={event.status} />
            {event.replay && <ReplayBadge />}
          </div>
          <p className="mt-0.5 text-sm text-foreground">
            {stop?.name ?? event.stop_id}
            <span className="text-muted-foreground"> · {stop?.municipality}</span>
          </p>
          {route && <p className="text-xs text-muted-foreground">{route.name}</p>}

          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>Seen {formatAge(minutesSince(event.last_observed_at, now))}</span>
            {commuterSources > 0 && (
              <span className="inline-flex items-center gap-1">
                <Users className="size-3" />
                {commuterSources} commuter{commuterSources === 1 ? "" : "s"}
              </span>
            )}
            {event.official_sources > 0 && (
              <span className="inline-flex items-center gap-1">
                <Building2 className="size-3" />
                {event.official_sources} official{manualOfficial ? " (manually entered)" : ""}
              </span>
            )}
            <ConfidenceMeter value={event.confidence} />
          </p>

          <p className="mt-1.5 text-xs font-medium text-foreground">{event.consequence}</p>
          {!compact && expiresIn !== null && (
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {event.blocking
                ? "Stays in effect until someone reports it cleared."
                : `Fades in about ${formatDuration(Math.max(expiresIn, 1))} unless someone confirms it.`}
            </p>
          )}
        </div>
      </div>
      {!compact && !event.replay && <EventActions event={event} />}
    </article>
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
      setMessage(kind === "confirmation" ? "Thanks — your confirmation was added." : "Thanks — noted as cleared.");
      await refresh();
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Could not send.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mt-3 border-t pt-2.5">
      <div className="flex gap-2">
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void send("confirmation")}
          className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border text-sm font-medium hover:bg-accent disabled:opacity-60"
        >
          {busy === "confirmation" ? <Loader2 className="size-4 animate-spin" /> : <Eye className="size-4" />}
          I see this too
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void send("clearance")}
          className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border text-sm font-medium hover:bg-accent disabled:opacity-60"
        >
          {busy === "clearance" ? <Loader2 className="size-4 animate-spin" /> : <CircleCheck className="size-4" />}
          It&apos;s cleared
        </button>
      </div>
      {message && <p className="mt-2 text-xs text-muted-foreground" role="status">{message}</p>}
    </div>
  );
}
