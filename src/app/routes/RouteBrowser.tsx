"use client";

import { useState } from "react";
import ModeFilterPills, {
  type ModeFilter,
} from "@/components/routes/ModeFilterPills";
import RouteCard from "@/components/routes/RouteCard";
import { routes } from "@/lib/catalog";

const SOURCE_URL = "https://cebujeepneys.weebly.com/jeepney-routes.html";

function UnverifiedDataNotice({ count }: { count: number }) {
  return (
    <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
      ⚠️ Routes marked <strong>unverified</strong> ({count}) were imported
      from{" "}
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
      <h1 className="text-2xl font-bold text-gray-900">Routes</h1>
      <p className="mt-1 text-sm text-gray-500">
        All routes in the Komyut ta Bai dataset.
      </p>

      <ModeFilterPills value={filter} onChange={setFilter} />

      {unverifiedCount > 0 && <UnverifiedDataNotice count={unverifiedCount} />}

      {visibleRoutes.length === 0 ? (
        <p className="mt-10 text-center text-sm text-gray-500">
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
