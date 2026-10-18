"use client";

import { ChevronDown, Clock, Coins } from "lucide-react";
import { useState } from "react";
import ShareTripButton from "@/components/plan/ShareTripButton";
import type { Itinerary } from "@/core/planner";
import { formatPeso } from "@/core/transit/fare";
import { formatClock, formatDuration } from "@/core/transit/time";
import type { Stop } from "@/core/transit/types";
import { MODE_CONFIG } from "@/lib/presentation";

function Stat({ Icon, label, value, note }: { Icon: typeof Clock; label: string; value: string; note: string }) {
  return (
    <div className="flex-1">
      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-primary-foreground/80">
        <Icon className="size-3.5" />
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      <p className="text-xs text-primary-foreground/75">{note}</p>
    </div>
  );
}

interface Props {
  itinerary: Itinerary;
  origin: Stop;
  destination: Stop;
}

export default function ItinerarySummary({ itinerary, origin, destination }: Props) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const parts = [
    `${formatDuration(itinerary.riding_mins)} riding`,
    itinerary.waiting_mins >= 1 && `${formatDuration(itinerary.waiting_mins)} waiting`,
    itinerary.walking_mins >= 1 && `${formatDuration(itinerary.walking_mins)} walking`,
  ].filter(Boolean);

  return (
    <div className="mt-4 rounded-2xl bg-gradient-to-br from-primary to-primary/80 px-5 py-4 text-primary-foreground shadow-sm">
      <div className="flex items-start">
        <Stat
          Icon={Clock}
          label="Total time"
          value={formatDuration(itinerary.total_mins)}
          note={`${formatClock(itinerary.depart_at)} → ${formatClock(itinerary.arrive_at)}`}
        />
        <div className="mx-4 h-14 w-px self-center bg-primary-foreground/20" />
        <Stat
          Icon={Coins}
          label="Total fare"
          value={formatPeso(itinerary.fare)}
          note={`${formatPeso(itinerary.discounted_fare)} student/senior/PWD`}
        />
      </div>

      <p className="mt-3 text-xs text-primary-foreground/80">{parts.join(" · ")}</p>

      <div className="mt-3 flex items-center justify-between border-t border-primary-foreground/15 pt-2">
        <p className="text-xs text-primary-foreground/80">
          {itinerary.rides} ride{itinerary.rides === 1 ? "" : "s"}
        </p>
        <div className="flex items-center gap-2">
          <ShareTripButton origin={origin} destination={destination} itinerary={itinerary} />
          <button
            type="button"
            onClick={() => setShowBreakdown((open) => !open)}
            aria-expanded={showBreakdown}
            className="flex min-h-9 items-center gap-1 text-xs text-primary-foreground/80 hover:text-primary-foreground"
          >
            Fares
            <ChevronDown className={`size-3.5 transition-transform ${showBreakdown ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {showBreakdown && (
        <div className="mt-2 space-y-1.5 rounded-xl bg-black/15 p-3">
          {itinerary.legs.map((leg, index) => {
            if (leg.kind !== "ride") return null;
            const config = MODE_CONFIG[leg.route.mode];
            return (
              <div key={index} className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${config.badge}`}>{config.label}</span>
                  <span className="truncate text-xs text-primary-foreground/80">{leg.route.name}</span>
                </div>
                <span className="shrink-0 text-xs font-semibold">{formatPeso(leg.fare)}</span>
              </div>
            );
          })}
          <div className="mt-1 flex items-center justify-between border-t border-primary-foreground/15 pt-1.5">
            <span className="text-xs font-semibold text-primary-foreground/80">Total</span>
            <span className="text-sm font-bold">{formatPeso(itinerary.fare)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
