import type { JourneyResult } from "@/lib/types";
import { formatFare } from "@/lib/utils/fare";
import { formatDuration } from "@/lib/utils/time";

export default function JourneySummaryCard({
  result,
}: {
  result: JourneyResult;
}) {
  return (
    <div className="mt-4 flex items-center justify-between rounded-2xl bg-primary px-5 py-4 text-white">
      <div>
        <p className="text-xs uppercase tracking-wide opacity-80">
          Total fare
        </p>
        <p className="text-2xl font-bold">{formatFare(result.total_fare)}</p>
      </div>
      <div className="text-right">
        <p className="text-xs uppercase tracking-wide opacity-80">
          Total time
        </p>
        <p className="text-2xl font-bold">
          {formatDuration(result.total_duration_mins)}
        </p>
      </div>
    </div>
  );
}
