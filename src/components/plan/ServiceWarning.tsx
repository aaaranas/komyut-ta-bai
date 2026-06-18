import { AlertTriangle } from "lucide-react";
import type { Leg } from "@/lib/types";

function parseMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function isOutsideWindow(
  nowMinutes: number,
  first: string,
  last: string
): boolean {
  const start = parseMinutes(first);
  let end = parseMinutes(last);
  // Handles overnight services like 05:00–02:00
  if (end < start) end += 24 * 60;
  const adjusted = nowMinutes < start ? nowMinutes + 24 * 60 : nowMinutes;
  return adjusted < start || adjusted > end;
}

interface Props {
  legs: Leg[];
  nowMinutes?: number;
}

export default function ServiceWarning({ legs, nowMinutes }: Props) {
  const now =
    nowMinutes ??
    (() => {
      const d = new Date();
      return d.getHours() * 60 + d.getMinutes();
    })();

  const offLegs = legs.filter(
    (leg) =>
      leg.mode !== "transfer" &&
      leg.route &&
      isOutsideWindow(now, leg.route.first_trip, leg.route.last_trip)
  );

  if (offLegs.length === 0) return null;

  return (
    <div className="mt-4 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-500/30 dark:bg-amber-500/10">
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
      <div className="text-sm">
        <p className="font-semibold text-amber-800 dark:text-amber-300">
          Outside service hours
        </p>
        <ul className="mt-1 space-y-0.5 text-amber-700 dark:text-amber-400">
          {offLegs.map((leg, i) => (
            <li key={i}>
              <span className="font-medium">{leg.route!.name}</span> runs{" "}
              {leg.route!.first_trip}–{leg.route!.last_trip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
