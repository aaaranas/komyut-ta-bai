"use client";

import dynamic from "next/dynamic";
import type { Stop } from "@/core/transit/types";

// maplibre-gl touches `window`; load it client-side only.
const RouteMapCanvas = dynamic(() => import("@/components/map/RouteMapCanvas"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted" />,
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
