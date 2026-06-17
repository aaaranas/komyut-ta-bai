import { ArrowLeft, ExternalLink, TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import RouteMap from "@/components/RouteMap";
import RouteFactsGrid from "@/components/routes/RouteFactsGrid";
import RouteSchedule from "@/components/routes/RouteSchedule";
import StopSequenceList from "@/components/routes/StopSequenceList";
import UnverifiedBadge from "@/components/routes/UnverifiedBadge";
import { getRoute, getRouteGeometry, orderedStopsOf, routes } from "@/lib/catalog";
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
    <div className="mt-3 flex gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-700 dark:text-amber-300">
      <TriangleAlert className="mt-0.5 size-4 shrink-0" />
      <p>
        Unverified route imported from{" "}
        {route.source_url ? (
          <a
            href={route.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 font-medium underline"
          >
            an external source
            <ExternalLink className="size-3" />
          </a>
        ) : (
          "an external source"
        )}
        . Stop positions are geocoded approximations; fares and times are
        estimates.
      </p>
    </div>
  );
}

export default async function RouteDetailPage({
  params,
}: PageProps<"/routes/[id]">) {
  const { id } = await params;
  const route = getRoute(id);
  if (!route) notFound();

  const config = MODE_CONFIG[route.mode];
  const Icon = config.Icon;
  const orderedStops = orderedStopsOf(route);
  const path = getRouteGeometry(route.id);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-12 pt-6">
      <Link
        href="/routes"
        className="mb-4 inline-flex min-h-9 items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="size-4" />
        All routes
      </Link>

      <div className="flex items-start gap-3">
        <span
          className={`grid size-11 shrink-0 place-items-center rounded-xl ${config.badge}`}
        >
          <Icon className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {route.name}
            </h1>
            {route.unverified && <UnverifiedBadge />}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {config.label} · {route.operator}
          </p>
        </div>
      </div>

      {route.unverified && <UnverifiedSourceNotice route={route} />}

      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-8">
        <div>
          <RouteFactsGrid route={route} />

          {route.schedule && <RouteSchedule schedule={route.schedule} />}

          <div className="mt-5 overflow-hidden rounded-xl border">
            <RouteMap stops={orderedStops} color={config.hex} path={path} />
          </div>
        </div>

        <div className="mt-6 lg:mt-4">
          <h2 className="text-base font-semibold text-foreground">
            Stops ({orderedStops.length})
          </h2>
          <StopSequenceList stops={orderedStops} mode={route.mode} />

          <p className="text-xs text-muted-foreground">
            {route.unverified
              ? `Imported ${route.verified_date}, not yet field-verified.`
              : `Data last verified ${route.verified_date}.`}
          </p>
        </div>
      </div>
    </main>
  );
}
