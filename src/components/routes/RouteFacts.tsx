import { describeFare } from "@/core/transit/fare";
import { headwaySummary, serviceHours } from "@/core/transit/service";
import { formatDuration } from "@/core/transit/time";
import type { Route } from "@/core/transit/types";

const EVIDENCE = {
  published: "published or field-checked",
  observed: "from observed rides",
  estimate: "an estimate",
} as const;

export default function RouteFacts({ route }: { route: Route }) {
  const facts = [
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
