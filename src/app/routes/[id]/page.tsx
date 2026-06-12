import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import RouteMap from "@/components/RouteMap";
import RouteFactsGrid from "@/components/routes/RouteFactsGrid";
import StopSequenceList from "@/components/routes/StopSequenceList";
import UnverifiedBadge from "@/components/routes/UnverifiedBadge";
import { getRoute, orderedStopsOf, routes } from "@/lib/catalog";
import { MODE_CONFIG } from "@/lib/constants";
import type { Route } from "@/lib/types";

export function generateStaticParams() {
  return routes.map((route) => ({ id: route.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/routes/[id]">): Promise<Metadata> {
  const { id } = await params;
  const route = getRoute(id);
  return { title: `${route?.name ?? "Route"} — Komyut ta Bai` };
}

function UnverifiedSourceNotice({ route }: { route: Route }) {
  return (
    <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
      ⚠️ Unverified route imported from{" "}
      {route.source_url ? (
        <a
          href={route.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium underline"
        >
          an external source
        </a>
      ) : (
        "an external source"
      )}
      . Stop positions are geocoded approximations; fares and times are
      estimates.
    </p>
  );
}

export default async function RouteDetailPage({
  params,
}: PageProps<"/routes/[id]">) {
  const { id } = await params;
  const route = getRoute(id);
  if (!route) notFound();

  const config = MODE_CONFIG[route.mode];
  const orderedStops = orderedStopsOf(route);

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 pb-12 pt-6">
      <Link
        href="/routes"
        className="mb-4 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-primary"
      >
        ← All routes
      </Link>

      <div className="flex items-start justify-between gap-2">
        <h1 className="text-2xl font-bold text-gray-900">{route.name}</h1>
        <span className="mt-1 flex shrink-0 items-center gap-1">
          {route.unverified && <UnverifiedBadge />}
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${config.badge}`}
          >
            {config.icon} {config.label}
          </span>
        </span>
      </div>
      <p className="mt-1 text-sm text-gray-500">{route.operator}</p>

      {route.unverified && <UnverifiedSourceNotice route={route} />}

      <RouteFactsGrid route={route} />

      <div className="mt-5">
        <RouteMap stops={orderedStops} color={config.hex} />
      </div>

      <h2 className="mt-6 text-base font-semibold text-gray-900">
        Stops ({orderedStops.length})
      </h2>
      <StopSequenceList stops={orderedStops} mode={route.mode} />

      <p className="text-xs text-gray-400">
        {route.unverified
          ? `Imported ${route.verified_date}, not yet field-verified.`
          : `Data last verified ${route.verified_date}.`}
      </p>
    </main>
  );
}
