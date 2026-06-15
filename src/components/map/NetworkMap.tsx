"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface NetworkLayer {
  id: string;
  routeNumber: number;
  color: string;
  coordinates: [number, number][];
}

export interface NetworkLegendItem {
  routeNumber: number;
  label: string;
  color: string;
  fare: string;
}

const NetworkMapCanvas = dynamic(
  () => import("@/components/map/NetworkMapCanvas"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[60vh] w-full items-center justify-center bg-muted text-sm text-muted-foreground">
        Loading map…
      </div>
    ),
  }
);

export default function NetworkMap({
  layers,
  legend,
  stops,
}: {
  layers: NetworkLayer[];
  legend: NetworkLegendItem[];
  stops: { lng: number; lat: number; name: string }[];
}) {
  const [hidden, setHidden] = useState<number[]>([]);

  const toggle = (routeNumber: number) =>
    setHidden((current) =>
      current.includes(routeNumber)
        ? current.filter((n) => n !== routeNumber)
        : [...current, routeNumber]
    );

  return (
    <div className="overflow-hidden rounded-xl border">
      <NetworkMapCanvas layers={layers} stops={stops} hidden={hidden} />
      <div className="flex flex-wrap gap-2 border-t bg-card p-3">
        {legend.map((item) => {
          const off = hidden.includes(item.routeNumber);
          return (
            <button
              key={item.routeNumber}
              type="button"
              onClick={() => toggle(item.routeNumber)}
              aria-pressed={!off}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs transition-opacity",
                off && "opacity-40"
              )}
            >
              <span
                className="size-3 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-semibold text-foreground">{item.label}</span>
              <span className="text-muted-foreground">{item.fare}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
