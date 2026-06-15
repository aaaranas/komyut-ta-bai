import { Clock, Coins } from "lucide-react";
import type { JourneyResult } from "@/lib/types";
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

export default function JourneySummaryCard({
  result,
}: {
  result: JourneyResult;
}) {
  const transfers = result.legs.filter((leg) => leg.mode !== "transfer").length;
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
      <p className="mt-3 border-t border-primary-foreground/15 pt-2 text-xs text-primary-foreground/80">
        {transfers} ride{transfers === 1 ? "" : "s"} · {result.legs.length}{" "}
        leg{result.legs.length === 1 ? "" : "s"} total
      </p>
    </div>
  );
}
