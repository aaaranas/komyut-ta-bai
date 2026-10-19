"use client";

import { ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import ItinerarySummary from "@/components/plan/ItinerarySummary";
import LegTimeline from "@/components/plan/LegTimeline";
import LiveImpact, { type PlanView as View } from "@/components/plan/LiveImpact";
import NoRouteFound from "@/components/plan/NoRouteFound";
import { useConditions } from "@/components/providers/ConditionsProvider";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Segmented } from "@/components/ui/segmented";
import { planJourney, retimeItinerary, type PlanRequest, type Preference } from "@/core/planner";
import { getStop } from "@/core/transit/catalog";
import { departureTimeOf, formatClock, parseLocalDateTime } from "@/core/transit/time";

const JourneyMap = dynamic(() => import("@/components/plan/JourneyMap"), {
  ssr: false,
  loading: () => <div className="h-56 w-full rounded-xl bg-muted md:h-full" />,
});

type RideLimit = "any" | "2" | "1";
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
  const rideParam = params.get("rides");
  const rideLimit: RideLimit = rideParam === "1" || rideParam === "2" ? rideParam : "any";
  const departure = useDeparture(params.get("when"));
  const { compiled, status } = useConditions();
  const [view, setView] = useState<View>("live");
  const wide = useMediaQuery("(min-width: 768px)");

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
  const live = useMemo(() => (compiled ? planJourney({ ...request, conditions: compiled }) : null), [request, compiled]);
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
  const dateLabel = departure.isNow
    ? "Leaving now"
    : `Leaving ${departure.date.toLocaleDateString("en-PH", { weekday: "long", month: "short", day: "numeric" })}`;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-16 pt-5">
      <Link href="/" className="inline-flex min-h-9 items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Change trip
      </Link>

      <div className="md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] md:gap-12">
        <div>
          <h1 className="mt-2 text-2xl font-extrabold leading-tight tracking-[-0.02em]">
            {origin?.name ?? (originId || "Unknown stop")}
            <span className="block font-semibold text-muted-foreground">to {destination?.name ?? (destinationId || "unknown stop")}</span>
          </h1>
          <p className="mt-1.5 text-sm tabular-nums text-muted-foreground">
            {dateLabel}, {formatClock(request.depart.minutes)}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Segmented
              label="Optimize for"
              value={preference}
              onChange={(next) => update({ pref: next })}
              options={[
                { value: "fastest", label: "Fastest" },
                { value: "cheapest", label: "Cheapest" },
              ]}
            />
            <Segmented
              label="Transfers"
              value={rideLimit}
              onChange={(next) => update({ rides: next })}
              options={[
                { value: "any", label: "Any" },
                { value: "2", label: "1 transfer" },
                { value: "1", label: "Direct" },
              ]}
            />
          </div>

          {baseline.status === "same_stop" ? (
            <p className="mt-10 text-sm text-muted-foreground">You&apos;re already there, bai. Pick a different destination.</p>
          ) : baseline.status !== "ok" || !origin || !destination || !shown ? (
            <NoRouteFound limited={rideLimit !== "any"} />
          ) : (
            <>
              <div className="mt-8">
                <ItinerarySummary itinerary={shown} origin={origin} destination={destination} />
              </div>
              <div className="mt-6">
                <LiveImpact
                  status={status}
                  baseline={baseline.itinerary}
                  live={live}
                  usualToday={usualToday}
                  view={view}
                  onViewChange={setView}
                />
              </div>
              {!wide && (
                <div className="mt-6">
                  <JourneyMap itinerary={shown} className="h-56" />
                </div>
              )}
              <div className="mt-6 border-t pt-4">
                <LegTimeline itinerary={shown} />
              </div>
              <p className="mt-8 max-w-prose text-xs leading-relaxed text-muted-foreground">
                Times are estimates. Waits assume half the usual time between vehicles, and live adjustments come from
                verified commuter reports.
              </p>
            </>
          )}
        </div>

        {wide && shown && origin && destination && baseline.status === "ok" && (
          <div>
            <div className="sticky top-20 mt-12 h-[calc(100dvh-8rem)]">
              <JourneyMap itinerary={shown} className="h-full" />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
