import type { Route } from "@/lib/types";
import { describeFare } from "@/lib/utils/fare";
import { formatDuration } from "@/lib/utils/time";

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-400">
        {label}
      </dt>
      <dd className="font-semibold text-gray-900">{value}</dd>
    </div>
  );
}

export default function RouteFactsGrid({ route }: { route: Route }) {
  return (
    <dl className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-gray-200 bg-white p-4 text-sm shadow-sm">
      <Fact label="Fare" value={describeFare(route)} />
      <Fact label="Travel time" value={formatDuration(route.duration_mins)} />
      <Fact label="Frequency" value={`every ${route.frequency_mins} min`} />
      <Fact
        label="Service hours"
        value={`${route.first_trip}–${route.last_trip}`}
      />
    </dl>
  );
}
