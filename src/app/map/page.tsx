import type { Metadata } from "next";
import NetworkMap, {
  type NetworkLayer,
  type NetworkLegendItem,
} from "@/components/map/NetworkMap";
import { getRouteGeometry, routes } from "@/core/transit/catalog";
import { describeFare } from "@/core/transit/fare";
import { myBusStops } from "@/data/mybus-stops";

export const metadata: Metadata = {
  title: "MyBus network map — Komyut ta Bai",
};

// Distinct line colors per route number (1–5).
const ROUTE_COLORS = ["#e11d48", "#2563eb", "#f59e0b", "#7c3aed", "#0d9488"];

const routeNumberOf = (id: string) => Number(/r(\d)/.exec(id)?.[1] ?? 0);

export default function NetworkMapPage() {
  const myBusRoutes = routes.filter((route) => route.mode === "mybus");

  const layers: NetworkLayer[] = myBusRoutes.map((route) => {
    const number = routeNumberOf(route.id);
    return {
      id: route.id,
      routeNumber: number,
      color: ROUTE_COLORS[(number - 1) % ROUTE_COLORS.length],
      coordinates: getRouteGeometry(route.id) ?? [],
    };
  });

  const legend: NetworkLegendItem[] = [];
  for (const route of myBusRoutes) {
    const number = routeNumberOf(route.id);
    if (legend.some((item) => item.routeNumber === number)) continue;
    legend.push({
      routeNumber: number,
      label: `Route ${number}`,
      color: ROUTE_COLORS[(number - 1) % ROUTE_COLORS.length],
      fare: describeFare(route.fare),
    });
  }

  const stops = myBusStops.map((stop) => ({
    lng: stop.lng,
    lat: stop.lat,
    name: stop.name,
  }));

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-16 pt-8">
      <h1 className="text-[2rem] font-extrabold leading-tight tracking-[-0.025em]">MyBus network</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Every MyBus line along the roads it runs. Tap a route below to show or hide it.
      </p>
      <div className="mt-4">
        <NetworkMap layers={layers} legend={legend} stops={stops} />
      </div>
    </main>
  );
}
