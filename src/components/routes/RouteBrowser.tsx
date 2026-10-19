"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { UnverifiedTag } from "@/components/common/badges";
import RoutePlate from "@/components/common/RoutePlate";
import { routes } from "@/core/transit/catalog";
import { describeFare } from "@/core/transit/fare";
import { headwaySummary } from "@/core/transit/service";
import type { Mode, Route } from "@/core/transit/types";
import { MODE_CONFIG, MODE_ORDER, routeCode, routeSubtitle, routeTitle } from "@/lib/presentation";
import { cn } from "@/lib/utils";

type ModeFilter = Mode | "all";

const SORTED = [...routes].sort(
  (a, b) =>
    Number(a.provenance.status === "unverified") - Number(b.provenance.status === "unverified") ||
    MODE_ORDER.indexOf(a.mode) - MODE_ORDER.indexOf(b.mode) ||
    routeCode(a).localeCompare(routeCode(b), "en", { numeric: true })
);

function matches(route: Route, needle: string): boolean {
  if (!needle) return true;
  const haystack = `${routeCode(route)} ${route.name} ${route.operator}`.toLowerCase();
  return haystack.includes(needle);
}

function RouteRow({ route }: { route: Route }) {
  return (
    <Link href={`/routes/${route.id}`} className="flex items-start gap-3 py-3 hover:bg-accent/60 sm:-mx-2 sm:rounded-lg sm:px-2">
      <RoutePlate route={route} />
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-medium leading-snug">{routeTitle(route)}</p>
        <p className="text-xs text-muted-foreground">
          {routeSubtitle(route)}
          {route.provenance.status === "unverified" && <UnverifiedTag className="ml-2" />}
        </p>
      </div>
      <div className="hidden shrink-0 text-right text-xs text-muted-foreground sm:block">
        <p>{describeFare(route.fare)}</p>
        <p>{headwaySummary(route)}</p>
      </div>
    </Link>
  );
}

export default function RouteBrowser() {
  const [filter, setFilter] = useState<ModeFilter>("all");
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const visible = useMemo(
    () => SORTED.filter((route) => (filter === "all" || route.mode === filter) && matches(route, needle)),
    [filter, needle]
  );
  const unverified = visible.filter((route) => route.provenance.status === "unverified").length;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 pt-8">
      <h1 className="text-[2rem] font-extrabold leading-tight tracking-[-0.025em]">Routes</h1>
      <p className="mt-1 text-sm text-muted-foreground">{routes.length} routes in the curated dataset.</p>

      <div className="mt-6 flex items-center gap-2 rounded-lg border border-input px-3 focus-within:border-ring">
        <Search className="size-4 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by code or place, e.g. 01K or Talisay"
          aria-label="Search routes"
          className="h-11 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div role="group" aria-label="Filter by mode" className="scrollbar-thin -mx-4 mt-3 flex gap-1.5 overflow-x-auto px-4">
        {(["all", ...MODE_ORDER] as const).map((mode) => {
          const active = filter === mode;
          return (
            <button
              key={mode}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(mode)}
              className={cn(
                "inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm transition-colors",
                active ? "border-foreground bg-foreground text-background" : "border-input hover:bg-accent"
              )}
            >
              {mode !== "all" && (
                <span className="size-2 rounded-full" style={{ backgroundColor: MODE_CONFIG[mode].hex }} aria-hidden="true" />
              )}
              {mode === "all" ? "All" : MODE_CONFIG[mode].label}
            </button>
          );
        })}
      </div>

      {unverified > 0 && (
        <p className="mt-4 max-w-prose text-xs text-muted-foreground">
          {unverified} of these were imported from{" "}
          <a
            href="https://cebujeepneys.weebly.com/jeepney-routes.html"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            cebujeepneys.weebly.com
          </a>{" "}
          and are marked unverified: stops are geocoded approximations and fares and times are estimates.
        </p>
      )}

      {visible.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">No routes match. Try a different code or place.</p>
      ) : (
        <ul className="mt-4 divide-y border-y">
          {visible.map((route) => (
            <li key={route.id}>
              <RouteRow route={route} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
