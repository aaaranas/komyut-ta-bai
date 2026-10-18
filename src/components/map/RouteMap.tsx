"use client";

import dynamic from "next/dynamic";
import type { Stop } from "@/core/transit/types";

// maplibre-gl touches `window`; load it client-side only.
const RouteMapCanvas = dynamic(() => import("@/components/map/RouteMapCanvas"), {
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
  return <RouteMapCanvas stops={stops} color={color} path={path} />;
}
