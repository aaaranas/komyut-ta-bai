"use client";

import { TriangleAlert } from "lucide-react";
import { useState } from "react";
import ModeFilterPills, {
  type ModeFilter,
} from "@/components/routes/ModeFilterPills";
import RouteCard from "@/components/routes/RouteCard";
import { routes } from "@/lib/catalog";

const SOURCE_URL = "https://cebujeepneys.weebly.com/jeepney-routes.html";

function UnverifiedDataNotice({ count }: { count: number }) {
  return (
    <div className="mt-4 flex gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-700 dark:text-amber-300">
      <TriangleAlert className="mt-0.5 size-4 shrink-0" />
      <p>
        {count} route{count === 1 ? "" : "s"} marked{" "}
        <strong>unverified</strong> were imported from{" "}
        <a
          href={SOURCE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium underline"
        >
          cebujeepneys.weebly.com
        </a>{" "}
        with approximate geocoded stops. Treat fares, times, and paths as
        tentative until field-checked.
      </p>
    </div>
  );
}

export default function RouteBrowser() {
  const [filter, setFilter] = useState<ModeFilter>("all");
  const visibleRoutes =
    filter === "all" ? routes : routes.filter((route) => route.mode === filter);
  const unverifiedCount = visibleRoutes.filter(
    (route) => route.unverified
  ).length;

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 pb-12 pt-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Routes
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {routes.length} routes across Cebu — filter by how you ride.
      </p>

      <div className="mt-4">
        <ModeFilterPills value={filter} onChange={setFilter} />
      </div>

      {unverifiedCount > 0 && <UnverifiedDataNotice count={unverifiedCount} />}

      {visibleRoutes.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          No routes for this mode yet. Know one? See the README for how to
          contribute.
        </p>
      ) : (
        <ul className="mt-5 flex flex-col gap-3">
          {visibleRoutes.map((route) => (
            <li key={route.id}>
              <RouteCard route={route} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
