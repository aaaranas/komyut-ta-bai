"use client";

import { ChevronDown, Clock, Coins } from "lucide-react";
import { useState } from "react";
import ShareTripButton from "@/components/plan/ShareTripButton";
import { MODE_CONFIG } from "@/lib/constants";
import type { JourneyResult, Stop } from "@/lib/types";
import { formatFare } from "@/lib/utils/fare";
import { formatDuration } from "@/lib/utils/time";

function Stat({
  Icon,
  label,
  value,
}: {
  Icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="flex-1">
      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-primary-foreground/80">
        <Icon className="size-3.5" />
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

interface Props {
  result: JourneyResult;
  origin: Stop;
  destination: Stop;
}

export default function JourneySummaryCard({ result, origin, destination }: Props) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const transitLegs = result.legs.filter((leg) => leg.mode !== "transfer");
  const transfers = transitLegs.length;

  return (
    <div className="mt-4 rounded-2xl bg-gradient-to-br from-primary to-primary/80 px-5 py-4 text-primary-foreground shadow-sm">
      <div className="flex items-center">
        <Stat Icon={Coins} label="Total fare" value={formatFare(result.total_fare)} />
        <div className="h-10 w-px bg-primary-foreground/20" />
        <div className="flex-1 pl-5">
          <Stat
            Icon={Clock}
            label="Total time"
            value={formatDuration(result.total_duration_mins)}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-primary-foreground/15 pt-2">
        <p className="text-xs text-primary-foreground/80">
          {transfers} ride{transfers === 1 ? "" : "s"} · {result.legs.length}{" "}
          leg{result.legs.length === 1 ? "" : "s"} total
        </p>
        <div className="flex items-center gap-2">
          <ShareTripButton origin={origin} destination={destination} result={result} />
          <button
            type="button"
            onClick={() => setShowBreakdown((v) => !v)}
            className="flex items-center gap-1 text-xs text-primary-foreground/70 hover:text-primary-foreground"
          >
            Fare breakdown
            <ChevronDown
              className={`size-3.5 transition-transform ${showBreakdown ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>

      {showBreakdown && (
        <div className="mt-2 space-y-1.5 rounded-xl bg-black/15 p-3">
          {result.legs.map((leg, i) => {
            if (leg.mode === "transfer") {
              return (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs text-primary-foreground/60">
                    Walk ({formatDuration(leg.duration_mins)})
                  </span>
                  <span className="text-xs text-primary-foreground/60">
                    {formatFare(0)}
                  </span>
                </div>
              );
            }
            const config = MODE_CONFIG[leg.mode];
            return (
              <div key={i} className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${config.badge}`}
                  >
                    {config.label}
                  </span>
                  <span className="truncate text-xs text-primary-foreground/80">
                    {leg.route?.name ?? "—"}
                  </span>
                </div>
                <span className="shrink-0 text-xs font-semibold text-primary-foreground">
                  {formatFare(leg.fare)}
                </span>
              </div>
            );
          })}
          <div className="mt-1 flex items-center justify-between border-t border-primary-foreground/15 pt-1.5">
            <span className="text-xs font-semibold text-primary-foreground/80">
              Total
            </span>
            <span className="text-sm font-bold text-primary-foreground">
              {formatFare(result.total_fare)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
