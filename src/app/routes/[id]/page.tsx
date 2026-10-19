import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { UnverifiedTag } from "@/components/common/badges";
import RoutePlate from "@/components/common/RoutePlate";
import RouteMap from "@/components/map/RouteMap";
import RouteFacts from "@/components/routes/RouteFacts";
import RouteLiveStatus from "@/components/routes/RouteLiveStatus";
import RouteSchedule from "@/components/routes/RouteSchedule";
import StopSequenceList from "@/components/routes/StopSequenceList";
import { getRoute, getRouteGeometry, orderedStopsOf, routes } from "@/core/transit/catalog";
import { MODE_CONFIG, routeSubtitle, routeTitle } from "@/lib/presentation";

export function generateStaticParams() {
  return routes.map((route) => ({ id: route.id }));
}

export async function generateMetadata({ params }: PageProps<"/routes/[id]">): Promise<Metadata> {
  const { id } = await params;
  const route = getRoute(id);
  return { title: `${route?.name ?? "Route"} — Komyut ta Bai` };
}

export default async function RouteDetailPage({ params }: PageProps<"/routes/[id]">) {
  const { id } = await params;
  const route = getRoute(id);
  if (!route) notFound();

  const mode = MODE_CONFIG[route.mode];
  const orderedStops = orderedStopsOf(route);
  const unverified = route.provenance.status === "unverified";

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-16 pt-5">
      <Link href="/routes" className="inline-flex min-h-9 items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        All routes
      </Link>

      <div className="mt-3 flex items-start gap-3">
        <RoutePlate route={route} className="mt-1" />
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold leading-tight tracking-[-0.02em]">{routeTitle(route)}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {routeSubtitle(route)}
          </p>
        </div>
      </div>

      {unverified && (
        <p className="mt-4 max-w-prose border-l-[3px] border-warn pl-3 text-sm">
          <UnverifiedTag className="mr-1 text-sm" /> Imported from{" "}
          {route.provenance.source_url ? (
            <a href={route.provenance.source_url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
              an external source
            </a>
          ) : (
            "an external source"
          )}{" "}
          without a field check. Stop positions are approximate and fares and times are estimates.
        </p>
      )}
      {route.notes && <p className="mt-4 max-w-prose border-l-[3px] border-input pl-3 text-sm text-muted-foreground">{route.notes}</p>}

      <div className="mt-6 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start md:gap-12">
        <div>
          <RouteFacts route={route} />
          <RouteSchedule service={route.service} />
          <RouteLiveStatus route={route} />
          <div className="mt-8 h-72 overflow-hidden rounded-xl border">
            <RouteMap stops={orderedStops} color={mode.hex} path={getRouteGeometry(route.id)} />
          </div>
        </div>

        <section className="mt-10 md:mt-0" aria-labelledby="stops">
          <h2 id="stops" className="text-base font-bold">
            {orderedStops.length} stops
          </h2>
          <StopSequenceList stops={orderedStops} color={mode.hex} />
          <p className="mt-4 text-xs text-muted-foreground">
            {unverified ? `Imported ${route.provenance.date}; not yet field-checked.` : `Last verified ${route.provenance.date}.`}
          </p>
        </section>
      </div>
    </main>
  );
}
