"use client";

import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import ItinerarySummary from "@/components/plan/ItinerarySummary";
import LegTimeline from "@/components/plan/LegTimeline";
import LiveImpact, { type PlanView as View } from "@/components/plan/LiveImpact";
import NoRouteFound from "@/components/plan/NoRouteFound";
import PreferenceToggle from "@/components/plan/PreferenceToggle";
import RideLimitFilter, { type RideLimit } from "@/components/plan/RideLimitFilter";
import { useConditions } from "@/components/providers/ConditionsProvider";
import { planJourney, retimeItinerary, type PlanRequest, type Preference } from "@/core/planner";
import { getStop } from "@/core/transit/catalog";
import { departureTimeOf, formatClock, parseLocalDateTime } from "@/core/transit/time";

const JourneyMap = dynamic(() => import("@/components/plan/JourneyMap"), {
  ssr: false,
  loading: () => <div className="mt-4 h-56 w-full animate-pulse rounded-2xl border bg-muted" />,
});

const RIDE_LIMITS: Record<RideLimit, number | undefined> = { any: undefined, "2": 2, "1": 1 };

/** The requested departure, or the moment the page opened for "leave now". */
function useDeparture(when: string | null) {
  const [openedAt] = useState(() => new Date());
  return useMemo(() => {
    const requested = when ? parseLocalDateTime(when) : null;
    return { date: requested ?? openedAt, isNow: requested === null };
  }, [when, openedAt]);
}

export default function PlanView() {
  const router = useRouter();
  const params = useSearchParams();
  const originId = params.get("from") ?? "";
  const destinationId = params.get("to") ?? "";
  const preference: Preference = params.get("pref") === "cheapest" ? "cheapest" : "fastest";
  const rideLimit = (["any", "2", "1"].includes(params.get("rides") ?? "") ? params.get("rides") : "any") as RideLimit;
  const when = params.get("when");
  const departure = useDeparture(when);
  const { compiled, status } = useConditions();
  const [view, setView] = useState<View>("live");

  const origin = getStop(originId);
  const destination = getStop(destinationId);

  const request = useMemo<PlanRequest>(
    () => ({
      origin: originId,
      destination: destinationId,
      preference,
      depart: departureTimeOf(departure.date),
      maxRides: RIDE_LIMITS[rideLimit],
    }),
    [originId, destinationId, preference, rideLimit, departure.date]
  );

  const baseline = useMemo(() => planJourney(request), [request]);
  const live = useMemo(
    () => (compiled ? planJourney({ ...request, conditions: compiled }) : null),
    [request, compiled]
  );
  const usualToday = useMemo(
    () =>
      compiled && baseline.status === "ok"
        ? retimeItinerary(baseline.itinerary, { ...request, conditions: compiled })
        : null,
    [request, compiled, baseline]
  );

  const update = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(patch)) next.set(key, value);
    router.replace(`/plan?${next}`);
  };

  const liveItinerary = live?.status === "ok" ? live.itinerary : null;
  const baselineItinerary = baseline.status === "ok" ? baseline.itinerary : null;
  const shown = view === "baseline" || !liveItinerary ? baselineItinerary : liveItinerary;

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-12 pt-6">
      <Link href="/" className="mb-4 inline-flex min-h-9 items-center gap-1.5 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="size-4" />
        Back to search
      </Link>

      <h1 className="flex flex-wrap items-center gap-x-2 gap-y-1 text-lg font-bold tracking-tight text-foreground">
        {origin?.name ?? (originId || "?")}
        <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
        {destination?.name ?? (destinationId || "?")}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {departure.isNow ? "Leaving now" : "Leaving"} · {formatClock(request.depart.minutes)}
        {!departure.isNow && ` · ${departure.date.toLocaleDateString("en-PH", { weekday: "short", month: "short", day: "numeric" })}`}
      </p>

      <PreferenceToggle value={preference} onChange={(next) => update({ pref: next })} />
      <RideLimitFilter value={rideLimit} onChange={(next) => update({ rides: next })} />

      {baseline.status === "same_stop" ? (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          You&apos;re already there, bai! Origin and destination are the same stop.
        </p>
      ) : baseline.status !== "ok" || !origin || !destination || !shown ? (
        <NoRouteFound limited={rideLimit !== "any"} />
      ) : (
        <>
          <LiveImpact
            status={status}
            baseline={baseline.itinerary}
            live={live}
            usualToday={usualToday}
            view={view}
            onViewChange={setView}
          />
          <ItinerarySummary itinerary={shown} origin={origin} destination={destination} />
          <JourneyMap itinerary={shown} />
          <ol className="mt-6">
            <LegTimeline itinerary={shown} />
            <li className="flex items-center gap-4">
              <div className="grid size-11 place-items-center rounded-full bg-primary text-primary-foreground">
                <MapPin className="size-5" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                Arrive at {destination.name} · {formatClock(shown.arrive_at)}
              </p>
            </li>
          </ol>
          <p className="mt-6 text-xs text-muted-foreground">
            Times are estimates. Waits for jeepneys, V-hires, and buses assume half the usual headway; live
            adjustments come from verified commuter reports and are never a guarantee.
          </p>
        </>
      )}
    </main>
  );
}
