"use client";

import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import JourneySummaryCard from "@/components/plan/JourneySummaryCard";
import LegRow from "@/components/plan/LegRow";
import NoRouteFound from "@/components/plan/NoRouteFound";
import PreferenceToggle from "@/components/plan/PreferenceToggle";
import { getStop } from "@/lib/catalog";
import { planJourney } from "@/lib/planner";
import type { Preference } from "@/lib/types";

export default function PlanResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const originId = searchParams.get("from") ?? "";
  const destinationId = searchParams.get("to") ?? "";
  const preference: Preference =
    searchParams.get("pref") === "cheapest" ? "cheapest" : "fastest";

  const origin = getStop(originId);
  const destination = getStop(destinationId);

  const result = useMemo(
    () =>
      originId && destinationId
        ? planJourney(originId, destinationId, preference)
        : null,
    [originId, destinationId, preference]
  );

  const handlePreferenceChange = (next: Preference) => {
    router.replace(`/plan?from=${originId}&to=${destinationId}&pref=${next}`);
  };

  const hasJourney = result !== null && origin && destination;

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-12 pt-6">
      <Link
        href="/"
        className="mb-4 inline-flex min-h-9 items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="size-4" />
        Back to search
      </Link>

      <h1 className="flex flex-wrap items-center gap-x-2 gap-y-1 text-lg font-bold tracking-tight text-foreground">
        {origin?.name ?? (originId || "?")}
        <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
        {destination?.name ?? (destinationId || "?")}
      </h1>

      <PreferenceToggle value={preference} onChange={handlePreferenceChange} />

      {!hasJourney ? (
        <NoRouteFound />
      ) : result.legs.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          You&apos;re already there, bai! Origin and destination are the same
          stop.
        </p>
      ) : (
        <>
          <JourneySummaryCard result={result} />

          <ol className="mt-6">
            {result.legs.map((leg, index) => (
              <LegRow
                key={`${leg.from_stop.id}-${index}`}
                leg={leg}
                isLast={index === result.legs.length - 1}
              />
            ))}
            <li className="flex items-center gap-4">
              <div className="grid size-11 place-items-center rounded-full bg-primary text-primary-foreground">
                <MapPin className="size-5" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                Arrive at {destination.name}
              </p>
            </li>
          </ol>

          <p className="mt-6 text-xs text-muted-foreground">
            Fares and times are estimates from community-verified data. Actual
            trips vary with traffic and sea conditions.
          </p>
        </>
      )}
    </main>
  );
}
