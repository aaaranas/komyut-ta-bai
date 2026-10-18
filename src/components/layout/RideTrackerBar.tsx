"use client";

import { CircleCheck, LocateFixed, Send, X } from "lucide-react";
import { useRideTracker } from "@/components/providers/RideTrackerProvider";
import { Button } from "@/components/ui/button";
import { getRoute } from "@/core/transit/catalog";
import { formatDuration } from "@/core/transit/time";
import { useNow } from "@/hooks/useNow";

/** Floating status while a ride is being traced, and the outcome afterwards. */
export default function RideTrackerBar() {
  const tracker = useRideTracker();
  const now = useNow(15_000);
  const route = tracker.routeId ? getRoute(tracker.routeId) : undefined;

  if (!route && !tracker.result && !tracker.error) return null;

  return (
    <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-40 px-3 pb-2 md:bottom-4">
      <div className="mx-auto flex max-w-md items-center gap-3 rounded-2xl border bg-card p-3 shadow-lg">
        {route ? (
          <>
            <span className="relative grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <LocateFixed className="size-4" />
              <span className="absolute right-0 top-0 size-2.5 animate-pulse rounded-full bg-emerald-500" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">Sharing ride time · {route.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatDuration((now.getTime() - (tracker.startedAt ?? now.getTime())) / 60_000)} ·{" "}
                {tracker.pointCount} location fixes kept on this phone
              </p>
            </div>
            <Button size="sm" onClick={() => void tracker.stop(true)}>
              <Send className="size-3.5" />
              Done
            </Button>
            <Button size="icon" variant="ghost" aria-label="Cancel without sending" onClick={() => void tracker.stop(false)}>
              <X className="size-4" />
            </Button>
          </>
        ) : (
          <>
            <CircleCheck className="size-5 shrink-0 text-primary" />
            <p className="flex-1 text-sm">
              {tracker.error ??
                (tracker.result?.status === "sent"
                  ? `Thanks! ${tracker.result.accepted} stop-to-stop time${tracker.result.accepted === 1 ? "" : "s"} shared${
                      tracker.result.rejected.length ? ` (${tracker.result.rejected.length} failed checks)` : ""
                    }.`
                  : tracker.result?.message)}
            </p>
            <Button size="icon" variant="ghost" aria-label="Dismiss" onClick={tracker.dismissResult}>
              <X className="size-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
