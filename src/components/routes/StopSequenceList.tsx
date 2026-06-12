import { MODE_CONFIG } from "@/lib/constants";
import type { Mode, Stop } from "@/lib/types";

export default function StopSequenceList({
  stops,
  mode,
}: {
  stops: Stop[];
  mode: Mode;
}) {
  const config = MODE_CONFIG[mode];
  return (
    <ol className="mt-3">
      {stops.map((stop, index) => (
        <li key={stop.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className={`mt-1 h-3 w-3 shrink-0 rounded-full ${config.dot}`} />
            {index < stops.length - 1 && (
              <div className="w-0.5 flex-1 bg-gray-200" />
            )}
          </div>
          <div className="pb-5">
            <p className="text-sm font-medium leading-tight text-gray-900">
              {stop.name}
            </p>
            <p className="text-xs text-gray-500">{stop.municipality}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
