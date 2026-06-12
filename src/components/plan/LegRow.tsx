import { MODE_CONFIG } from "@/lib/constants";
import type { Leg } from "@/lib/types";
import { formatFare } from "@/lib/utils/fare";
import { formatDuration } from "@/lib/utils/time";

function TransferDetails({ leg }: { leg: Leg }) {
  return (
    <>
      <p className="text-sm font-medium text-gray-700">
        Walk / transfer to{" "}
        <span className="font-semibold">{leg.to_stop.name}</span>
      </p>
      <p className="mt-0.5 text-xs text-gray-500">
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
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${config.badge}`}
        >
          {config.label}
        </span>
        <span className="text-sm font-semibold text-gray-900">
          {leg.route?.name}
        </span>
        {leg.route?.unverified && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
            unverified
          </span>
        )}
      </div>
      {leg.route && (
        <p className="mt-0.5 text-xs text-gray-500">
          {leg.route.operator} · every {leg.route.frequency_mins} min ·{" "}
          {leg.route.first_trip}–{leg.route.last_trip}
        </p>
      )}
      <p className="mt-2 text-sm text-gray-700">
        Board at{" "}
        <span className="font-medium text-gray-900">{leg.from_stop.name}</span>
      </p>
      <p className="text-sm text-gray-700">
        Alight at{" "}
        <span className="font-medium text-gray-900">{leg.to_stop.name}</span>
      </p>
      <p className="mt-1 text-xs font-medium text-gray-500">
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
  return (
    <li className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg text-white ${config.dot}`}
          aria-hidden="true"
        >
          {config.icon}
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-gray-300" />}
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
