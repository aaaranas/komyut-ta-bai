"use client";

import { ArrowUpDown, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import StopCombobox from "@/components/search/StopCombobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { majorHubs } from "@/core/transit/catalog";
import { toLocalDateTimeValue } from "@/core/transit/time";
import type { Stop } from "@/core/transit/types";
import { useRecentSearches } from "@/hooks/useRecentSearches";

/** `/plan` URL; `when` omitted means "leave now". */
export function planHref(fromId: string, toId: string, when?: string): string {
  const params = new URLSearchParams({ from: fromId, to: toId });
  if (when) params.set("when", when);
  return `/plan?${params}`;
}

const HUBS = majorHubs().slice(0, 8);

export default function JourneySearchForm() {
  const router = useRouter();
  const [origin, setOrigin] = useState<Stop | null>(null);
  const [destination, setDestination] = useState<Stop | null>(null);
  const [leaving, setLeaving] = useState<"now" | "later">("now");
  const [when, setWhen] = useState("");
  const { searches, addSearch, clearSearches } = useRecentSearches();

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (!origin || !destination) return;
    addSearch({ fromId: origin.id, toId: destination.id, fromName: origin.name, toName: destination.name });
    router.push(planHref(origin.id, destination.id, leaving === "later" && when ? when : undefined));
  };

  const chooseLeaving = (next: "now" | "later") => {
    setLeaving(next);
    if (next === "later" && !when) setWhen(toLocalDateTimeValue(new Date(Date.now() + 30 * 60_000)));
  };

  return (
    <form onSubmit={handleSearch}>
      <div className="relative rounded-xl border border-input">
        {/* The line joining origin and destination, as on a route map. */}
        <span className="pointer-events-none absolute left-[19px] top-[26px] h-[calc(100%-52px)] w-0.5 bg-border" aria-hidden="true" />
        <div className="pl-3.5 pr-12">
          <StopCombobox
            variant="bare"
            label="From"
            placeholder="From"
            value={origin}
            onChange={setOrigin}
            leading={<span className="size-3 shrink-0 rounded-full border-[3px] border-foreground bg-background" aria-hidden="true" />}
          />
        </div>
        <div className="ml-10 mr-12 border-t" />
        <div className="pl-3.5 pr-12">
          <StopCombobox
            variant="bare"
            label="To"
            placeholder="To"
            value={destination}
            onChange={setDestination}
            leading={<span className="size-3 shrink-0 rounded-[3px] bg-foreground" aria-hidden="true" />}
          />
        </div>
        <button
          type="button"
          aria-label="Swap origin and destination"
          onClick={() => {
            setOrigin(destination);
            setDestination(origin);
          }}
          className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <ArrowUpDown className="size-4" />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Segmented
          label="Leaving"
          value={leaving}
          onChange={chooseLeaving}
          options={[
            { value: "now", label: "Leave now" },
            { value: "later", label: "Later" },
          ]}
        />
        {leaving === "later" && (
          <Input
            type="datetime-local"
            aria-label="Departure date and time"
            value={when}
            onChange={(event) => setWhen(event.target.value)}
            className="h-10 w-auto flex-1"
          />
        )}
      </div>

      <Button type="submit" size="lg" disabled={!origin || !destination} className="mt-4 w-full">
        Find routes
      </Button>

      {searches.length > 0 ? (
        <div className="mt-8">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold">Recent</h2>
            <button type="button" onClick={clearSearches} className="text-xs text-muted-foreground hover:text-foreground">
              <X className="mr-0.5 inline size-3" />
              Clear
            </button>
          </div>
          <ul className="mt-1 divide-y">
            {searches.map((search) => (
              <li key={`${search.fromId}-${search.toId}`}>
                <button
                  type="button"
                  onClick={() => router.push(planHref(search.fromId, search.toId))}
                  className="flex min-h-11 w-full items-center gap-2 py-2 text-left text-sm hover:text-foreground"
                >
                  <span className="truncate font-medium">{search.fromName}</span>
                  <span className="text-muted-foreground">to</span>
                  <span className="truncate font-medium">{search.toName}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="mt-8">
          <h2 className="text-sm font-semibold">Start from a terminal or port</h2>
          <div className="scrollbar-thin -mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
            {HUBS.map((hub) => (
              <button
                key={hub.id}
                type="button"
                onClick={() => setOrigin(hub)}
                className="min-h-9 shrink-0 rounded-full border border-input px-3 text-sm hover:bg-accent"
              >
                {hub.name.replace(/\s*\((CSBT|CNBT)\)/, "")}
              </button>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
