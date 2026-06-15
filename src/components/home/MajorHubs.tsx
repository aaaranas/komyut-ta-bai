"use client";

import { majorHubs, routeCountAt } from "@/lib/catalog";
import { STOP_TYPE_CONFIG } from "@/lib/constants";
import type { Stop } from "@/lib/types";
import { cn } from "@/lib/utils";

const hubs = majorHubs();

/**
 * Quick-pick strip of notable terminals and ports. Tapping a hub sets it as
 * the journey origin, so commuters can start from a landmark they know.
 */
export default function MajorHubs({
  onSelect,
}: {
  onSelect: (stop: Stop) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Start from a major hub
      </p>
      <div className="scrollbar-thin -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {hubs.map((hub) => {
          const config = STOP_TYPE_CONFIG[hub.type];
          const Icon = config.Icon;
          const routeCount = routeCountAt(hub.id);
          return (
            <button
              key={hub.id}
              type="button"
              onClick={() => onSelect(hub)}
              className={cn(
                "flex w-40 shrink-0 flex-col gap-1.5 rounded-xl border p-3 text-left transition hover:shadow-md",
                config.tile
              )}
            >
              <Icon className="size-5" />
              <span className="text-sm font-semibold leading-tight">
                {hub.name}
              </span>
              <span className="text-[11px] opacity-70">
                {config.label} · {routeCount}{" "}
                {routeCount === 1 ? "route" : "routes"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
