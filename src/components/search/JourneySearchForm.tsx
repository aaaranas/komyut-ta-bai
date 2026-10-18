"use client";

import { ArrowRight, CalendarClock, Clock, Navigation, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import MajorHubs from "@/components/search/MajorHubs";
import StopCombobox from "@/components/search/StopCombobox";
import SwapButton from "@/components/search/SwapButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getStop } from "@/core/transit/catalog";
import { toLocalDateTimeValue } from "@/core/transit/time";
import type { Stop } from "@/core/transit/types";
import { useRecentSearches } from "@/hooks/useRecentSearches";
import { cn } from "@/lib/utils";

interface JourneySearchFormProps {
  initialFrom?: string;
  initialTo?: string;
}

/** `/plan` URL; `when` omitted means "leave now". */
export function planHref(fromId: string, toId: string, when?: string): string {
  const params = new URLSearchParams({ from: fromId, to: toId });
  if (when) params.set("when", when);
  return `/plan?${params}`;
}

export default function JourneySearchForm({ initialFrom, initialTo }: JourneySearchFormProps) {
  const router = useRouter();
  const [origin, setOrigin] = useState<Stop | null>(initialFrom ? getStop(initialFrom) ?? null : null);
  const [destination, setDestination] = useState<Stop | null>(initialTo ? getStop(initialTo) ?? null : null);
  const [leaveLater, setLeaveLater] = useState(false);
  const [when, setWhen] = useState("");
  const { searches, addSearch, clearSearches } = useRecentSearches();

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (!origin || !destination) return;
    addSearch({ fromId: origin.id, toId: destination.id, fromName: origin.name, toName: destination.name });
    router.push(planHref(origin.id, destination.id, leaveLater && when ? when : undefined));
  };

  const handleSwap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const chooseLater = () => {
    setLeaveLater(true);
    if (!when) setWhen(toLocalDateTimeValue(new Date(Date.now() + 30 * 60_000)));
  };

  return (
    <form onSubmit={handleSearch} className="flex flex-col gap-3">
      <StopCombobox label="From" placeholder="e.g. Argao" value={origin} onChange={setOrigin} />
      <div className="flex justify-center">
        <SwapButton onSwap={handleSwap} />
      </div>
      <StopCombobox
        label="To"
        placeholder="e.g. Santa Fe, Bantayan Island"
        value={destination}
        onChange={setDestination}
      />

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-foreground">Leaving</legend>
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
          {[
            { label: "Now", Icon: Clock, active: !leaveLater, onClick: () => setLeaveLater(false) },
            { label: "Later", Icon: CalendarClock, active: leaveLater, onClick: chooseLater },
          ].map(({ label, Icon, active, onClick }) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              aria-pressed={active}
              className={cn(
                "flex min-h-9 items-center justify-center gap-1.5 rounded-md text-sm font-medium transition-colors",
                active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>
        {leaveLater && (
          <Input
            type="datetime-local"
            aria-label="Departure date and time"
            value={when}
            onChange={(event) => setWhen(event.target.value)}
            className="mt-2"
          />
        )}
      </fieldset>

      {searches.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recent trips</p>
            <button
              type="button"
              onClick={clearSearches}
              className="flex min-h-8 items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
            >
              <X className="size-3" />
              Clear
            </button>
          </div>
          <div className="flex flex-col gap-1.5">
            {searches.map((search) => (
              <button
                key={`${search.fromId}-${search.toId}`}
                type="button"
                onClick={() => router.push(planHref(search.fromId, search.toId))}
                className="flex min-h-10 items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-left transition-colors hover:bg-accent"
              >
                <Clock className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="flex min-w-0 flex-1 items-center gap-1.5 text-sm">
                  <span className="truncate font-medium text-foreground">{search.fromName}</span>
                  <ArrowRight className="size-3 shrink-0 text-muted-foreground" />
                  <span className="truncate text-muted-foreground">{search.toName}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <MajorHubs onSelect={setOrigin} />

      <Button type="submit" size="lg" disabled={!origin || !destination} className="mt-1 w-full font-semibold">
        <Navigation className="size-4" />
        Plan journey
      </Button>
    </form>
  );
}
