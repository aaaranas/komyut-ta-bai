import { scopeOf } from "@/core/transit/catalog";
import { describeFare } from "@/core/transit/fare";
import { headwaySummary, serviceHours } from "@/core/transit/service";
import { formatDuration } from "@/core/transit/time";
import type { Route } from "@/core/transit/types";

const EVIDENCE = {
  published: "published or field-checked",
  observed: "from observed rides",
  estimate: "an estimate",
} as const;

export const SCOPE_NOTE = {
  metro: null,
  partial: "Runs beyond Metro Cebu; only its Metro Cebu stops are used for trip plans.",
  out: "Outside the Metro Cebu study area; listed for reference and not used for trip plans.",
} as const;

export function scopeNote(route: Route): string | null {
  const scope = scopeOf(route);
  if (scope === "out" && route.mode === "ferry") {
    return "Departs Metro Cebu. Scheduled ferry with no live sensing; not used for trip plans.";
  }
  return SCOPE_NOTE[scope];
}

export default function RouteFacts({ route }: { route: Route }) {
  const note = scopeNote(route);
  const facts = [
    ...(note ? [["Coverage", note]] : []),
    ["Fare", describeFare(route.fare)],
    ["End to end", formatDuration(route.duration_mins)],
    ["How often", `${headwaySummary(route)}, ${EVIDENCE[route.service.evidence]}`],
    ["Hours", serviceHours(route)],
    ["Direction", route.direction === "one_way" ? "This direction only" : "Both directions"],
  ];
  return (
    <dl className="divide-y border-y text-sm">
      {facts.map(([label, value]) => (
        <div key={label} className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3 py-2.5">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="font-medium tabular-nums">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
