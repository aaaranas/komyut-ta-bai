import StopTypeBadge from "@/components/StopTypeBadge";
import UnverifiedBadge from "@/components/routes/UnverifiedBadge";
import { MODE_CONFIG } from "@/lib/constants";
import type { Leg } from "@/lib/types";
import { formatFare } from "@/lib/utils/fare";
import { formatDuration } from "@/lib/utils/time";

function TransferDetails({ leg }: { leg: Leg }) {
  return (
    <>
      <p className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-foreground">
        Walk / transfer to <span className="font-semibold">{leg.to_stop.name}</span>
        <StopTypeBadge type={leg.to_stop.type} />
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {formatDuration(leg.duration_mins)}
      </p>
    </>
  );
}

function RideDetails({ leg }: { leg: Leg }) {
  const config = MODE_CONFIG[leg.mode];
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${config.badge}`}
        >
          {config.label}
        </span>
        <span className="text-sm font-semibold text-foreground">
          {leg.route?.name}
        </span>
        {leg.route?.unverified && <UnverifiedBadge />}
      </div>
      {leg.route && (
        <p className="mt-0.5 text-xs text-muted-foreground">
          {leg.route.operator} · every {leg.route.frequency_mins} min ·{" "}
          {leg.route.first_trip}–{leg.route.last_trip}
        </p>
      )}
      <p className="mt-2 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        Board at{" "}
        <span className="font-medium text-foreground">{leg.from_stop.name}</span>
        <StopTypeBadge type={leg.from_stop.type} />
      </p>
      <p className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        Alight at{" "}
        <span className="font-medium text-foreground">{leg.to_stop.name}</span>
        <StopTypeBadge type={leg.to_stop.type} />
      </p>
      <p className="mt-1 text-xs font-medium text-muted-foreground">
        {formatFare(leg.fare)} · {formatDuration(leg.duration_mins)}
      </p>
    </>
  );
}

export default function LegRow({
  leg,
  isLast,
}: {
  leg: Leg;
  isLast: boolean;
}) {
  const config = MODE_CONFIG[leg.mode];
  const Icon = config.Icon;
  return (
    <li className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`grid size-11 shrink-0 place-items-center rounded-full text-white ${config.dot}`}
        >
          <Icon className="size-5" />
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-border" />}
      </div>
      <div className="flex-1 pb-8">
        {leg.mode === "transfer" ? (
          <TransferDetails leg={leg} />
        ) : (
          <RideDetails leg={leg} />
        )}
      </div>
    </li>
  );
}
