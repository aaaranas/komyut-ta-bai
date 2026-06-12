"use client";

import dynamic from "next/dynamic";
import type { Stop } from "@/lib/types";

// maplibre-gl touches `window`; load it client-side only.
const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-72 w-full items-center justify-center rounded-2xl bg-gray-100 text-sm text-gray-400">
      Loading map…
    </div>
  ),
});

export default function RouteMap({
  stops,
  color,
}: {
  stops: Stop[];
  color: string;
}) {
  return <MapView stops={stops} color={color} />;
}
