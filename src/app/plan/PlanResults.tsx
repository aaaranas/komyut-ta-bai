"use client";

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
    <main className="mx-auto w-full max-w-md flex-1 px-4 pb-12 pt-6">
      <Link
        href="/"
        className="mb-4 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-primary"
      >
        ← Back to search
      </Link>

      <h1 className="text-xl font-bold text-gray-900">
        {origin?.name ?? (originId || "?")}{" "}
        <span className="text-gray-400">→</span>{" "}
        {destination?.name ?? (destinationId || "?")}
      </h1>

      <PreferenceToggle value={preference} onChange={handlePreferenceChange} />

      {!hasJourney ? (
        <NoRouteFound />
      ) : result.legs.length === 0 ? (
        <p className="mt-8 text-center text-sm text-gray-500">
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
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-lg text-white">
                📍
              </div>
              <p className="text-sm font-semibold text-gray-900">
                Arrive at {destination.name}
              </p>
            </li>
          </ol>

          <p className="mt-6 text-xs text-gray-400">
            Fares and times are estimates from community-verified data. Actual
            trips vary with traffic and sea conditions.
          </p>
        </>
      )}
    </main>
  );
}
