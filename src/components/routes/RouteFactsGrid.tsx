import { CalendarClock, Clock, Coins, Timer } from "lucide-react";
import type { ComponentType } from "react";
import type { Route } from "@/lib/types";
import { describeFare } from "@/lib/utils/fare";
import { formatDuration } from "@/lib/utils/time";

function Fact({
  Icon,
  label,
  value,
}: {
  Icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
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

export default function RouteFactsGrid({ route }: { route: Route }) {
  return (
    <dl className="mt-4 grid grid-cols-2 gap-2.5">
      <Fact Icon={Coins} label="Fare" value={describeFare(route)} />
      <Fact
        Icon={Clock}
        label="Travel time"
        value={formatDuration(route.duration_mins)}
      />
      <Fact
        Icon={Timer}
        label="Frequency"
        value={`every ${route.frequency_mins} min`}
      />
      <Fact
        Icon={CalendarClock}
        label="Service hours"
        value={`${route.first_trip}–${route.last_trip}`}
      />
    </dl>
  );
}
