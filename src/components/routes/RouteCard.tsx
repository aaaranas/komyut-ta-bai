import Link from "next/link";
import UnverifiedBadge from "@/components/routes/UnverifiedBadge";
import { MODE_CONFIG } from "@/lib/constants";
import type { Route } from "@/lib/types";
import { describeFare } from "@/lib/utils/fare";
import { formatDuration } from "@/lib/utils/time";

export default function RouteCard({ route }: { route: Route }) {
  const config = MODE_CONFIG[route.mode];
  return (
    <Link
      href={`/routes/${route.id}`}
      className="block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-primary"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-base font-semibold text-gray-900">
          {route.name}
        </span>
        <span className="flex shrink-0 items-center gap-1">
          {route.unverified && <UnverifiedBadge />}
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${config.badge}`}
          >
            {config.icon} {config.label}
          </span>
        </span>
      </div>
      <p className="mt-0.5 text-sm text-gray-500">{route.operator}</p>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
        <span>{describeFare(route)}</span>
        <span>{formatDuration(route.duration_mins)}</span>
        <span>every {route.frequency_mins} min</span>
        <span>
          {route.first_trip}–{route.last_trip}
        </span>
      </div>
    </Link>
  );
}
