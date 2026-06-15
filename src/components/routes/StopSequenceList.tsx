import StopTypeBadge from "@/components/StopTypeBadge";
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
            <div
              className={`mt-1.5 size-3 shrink-0 rounded-full ring-4 ring-background ${config.dot}`}
            />
            {index < stops.length - 1 && (
              <div className="w-0.5 flex-1 bg-border" />
            )}
          </div>
          <div className="pb-5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium leading-tight text-foreground">
                {stop.name}
              </p>
              <StopTypeBadge type={stop.type} />
            </div>
            <p className="text-xs text-muted-foreground">{stop.municipality}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
