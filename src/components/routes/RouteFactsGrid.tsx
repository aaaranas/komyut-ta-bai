import { ArrowLeftRight, CalendarClock, Clock, Coins, Timer } from "lucide-react";
import type { ComponentType } from "react";
import { describeFare } from "@/core/transit/fare";
import { headwaySummary, serviceHours } from "@/core/transit/service";
import { formatDuration } from "@/core/transit/time";
import type { Route } from "@/core/transit/types";

function Fact({ Icon, label, value }: { Icon: ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border bg-card p-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="text-sm font-semibold text-foreground">{value}</dd>
      </div>
    </div>
  );
}

const EVIDENCE_LABEL = {
  published: "published / field-checked",
  observed: "from observed rides",
  estimate: "estimate — not confirmed",
} as const;

export default function RouteFactsGrid({ route }: { route: Route }) {
  return (
    <dl className="mt-4 grid grid-cols-2 gap-2.5">
      <Fact Icon={Coins} label="Fare" value={describeFare(route.fare)} />
      <Fact Icon={Clock} label="End-to-end time" value={formatDuration(route.duration_mins)} />
      <Fact Icon={Timer} label={`Headway (${EVIDENCE_LABEL[route.service.evidence]})`} value={headwaySummary(route)} />
      <Fact Icon={CalendarClock} label="Service hours" value={serviceHours(route)} />
      <Fact
        Icon={ArrowLeftRight}
        label="Direction"
        value={route.direction === "one_way" ? "This direction only" : "Runs both ways"}
      />
    </dl>
  );
}
