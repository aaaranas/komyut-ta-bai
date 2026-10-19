import { StopKind } from "@/components/common/badges";
import type { Stop } from "@/core/transit/types";
import { cn } from "@/lib/utils";

/** A route's stops on its line color, ends marked heavier than stops between. */
export default function StopSequenceList({ stops, color }: { stops: Stop[]; color: string }) {
  return (
    <ol className="mt-3">
      {stops.map((stop, index) => {
        const isEnd = index === 0 || index === stops.length - 1;
        return (
          <li key={`${stop.id}-${index}`} className="grid grid-cols-[1rem_minmax(0,1fr)] gap-x-3">
            <span className="relative flex justify-center">
              {index > 0 && <span className="absolute top-0 h-3.5 w-1" style={{ backgroundColor: color }} />}
              {index < stops.length - 1 && <span className="absolute bottom-0 top-3.5 w-1" style={{ backgroundColor: color }} />}
              <span
                className={cn(
                  "relative mt-2 rounded-full bg-background",
                  isEnd ? "size-3.5 border-[3px] border-foreground" : "size-2.5 border-2"
                )}
                style={isEnd ? undefined : { borderColor: color }}
              />
            </span>
            <div className="pb-3">
              <p className={cn("text-sm leading-snug", isEnd ? "font-semibold" : "font-medium")}>
                {stop.name}
                <StopKind type={stop.type} />
              </p>
              <p className="text-xs text-muted-foreground">{stop.municipality}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
