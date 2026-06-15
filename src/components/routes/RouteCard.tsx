import { Clock, Coins, Timer } from "lucide-react";
import Link from "next/link";
import UnverifiedBadge from "@/components/routes/UnverifiedBadge";
import { MODE_CONFIG } from "@/lib/constants";
import type { Route } from "@/lib/types";
import { describeFare } from "@/lib/utils/fare";
import { formatDuration } from "@/lib/utils/time";

export default function RouteCard({ route }: { route: Route }) {
  const config = MODE_CONFIG[route.mode];
  const Icon = config.Icon;
  return (
    <Link
      href={`/routes/${route.id}`}
      className="block rounded-xl border bg-card p-4 shadow-sm transition-colors hover:border-primary/60 hover:bg-accent/40"
    >
      <div className="flex items-start gap-3">
        <span
          className={`grid size-10 shrink-0 place-items-center rounded-lg ${config.badge}`}
        >
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm font-semibold leading-tight text-foreground">
              {route.name}
            </span>
            {route.unverified && <UnverifiedBadge className="mt-0.5" />}
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {route.operator}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Coins className="size-3.5" />
          {describeFare(route)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3.5" />
          {formatDuration(route.duration_mins)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Timer className="size-3.5" />
          every {route.frequency_mins} min
        </span>
      </div>
    </Link>
  );
}
