"use client";

import { ArrowRight, Clock, Navigation, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import MajorHubs from "@/components/home/MajorHubs";
import StopCombobox from "@/components/StopCombobox";
import SwapButton from "@/components/SwapButton";
import { Button } from "@/components/ui/button";
import { getStop } from "@/lib/catalog";
import { useRecentSearches } from "@/lib/hooks/useRecentSearches";
import type { Stop } from "@/lib/types";

interface JourneySearchFormProps {
  initialFrom?: string;
  initialTo?: string;
}

export default function JourneySearchForm({
  initialFrom,
  initialTo,
}: JourneySearchFormProps) {
  const router = useRouter();
  const [origin, setOrigin] = useState<Stop | null>(
    initialFrom ? getStop(initialFrom) ?? null : null
  );
  const [destination, setDestination] = useState<Stop | null>(
    initialTo ? getStop(initialTo) ?? null : null
  );
  const { searches, addSearch, clearSearches } = useRecentSearches();

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (!origin || !destination) return;
    addSearch({
      fromId: origin.id,
      toId: destination.id,
      fromName: origin.name,
      toName: destination.name,
    });
    router.push(`/plan?from=${origin.id}&to=${destination.id}`);
  };

  const handleSwap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const handleRecent = (fromId: string, toId: string) => {
    const from = getStop(fromId);
    const to = getStop(toId);
    if (!from || !to) return;
    router.push(`/plan?from=${fromId}&to=${toId}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex flex-col gap-3">
      <StopCombobox
        label="From"
        placeholder="e.g. Argao"
        value={origin}
        onChange={setOrigin}
      />
      <div className="flex justify-center">
        <SwapButton onSwap={handleSwap} />
      </div>
      <StopCombobox
        label="To"
        placeholder="e.g. Santa Fe, Bantayan Island"
        value={destination}
        onChange={setDestination}
      />

      {searches.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Recent trips
            </p>
            <button
              type="button"
              onClick={clearSearches}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
            >
              <X className="size-3" />
              Clear
            </button>
          </div>
          <div className="flex flex-col gap-1.5">
            {searches.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleRecent(s.fromId, s.toId)}
                className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-left transition-colors hover:bg-accent"
              >
                <Clock className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="flex min-w-0 flex-1 items-center gap-1.5 text-sm">
                  <span className="truncate font-medium text-foreground">
                    {s.fromName}
                  </span>
                  <ArrowRight className="size-3 shrink-0 text-muted-foreground" />
                  <span className="truncate text-muted-foreground">
                    {s.toName}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <MajorHubs onSelect={setOrigin} />

      <Button
        type="submit"
        size="lg"
        disabled={!origin || !destination}
        className="mt-1 w-full font-semibold"
      >
        <Navigation className="size-4" />
        Plan journey
      </Button>
    </form>
  );
}
