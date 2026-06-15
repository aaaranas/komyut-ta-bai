"use client";

import dynamic from "next/dynamic";
import type { Stop } from "@/lib/types";

// maplibre-gl touches `window`; load it client-side only.
const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-72 w-full items-center justify-center bg-muted text-sm text-muted-foreground">
      Loading map…
    </div>
  ),
});

export default function RouteMap({
  stops,
  color,
  path,
}: {
  stops: Stop[];
  color: string;
  path?: [number, number][];
}) {
  return <MapView stops={stops} color={color} path={path} />;
}
