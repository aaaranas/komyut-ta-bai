"use client";

import { X } from "lucide-react";
import { useRideTracker } from "@/components/providers/RideTrackerProvider";
import { Button } from "@/components/ui/button";
import { getRoute } from "@/core/transit/catalog";
import { formatDuration } from "@/core/transit/time";
import { useNow } from "@/hooks/useNow";
import RoutePlate from "@/components/common/RoutePlate";

/** Status while a ride is being traced, and the outcome afterwards. */
export default function RideTrackerBar() {
  const tracker = useRideTracker();
  const now = useNow(15_000);
  const route = tracker.routeId ? getRoute(tracker.routeId) : undefined;

  if (!route && !tracker.result && !tracker.error) return null;

  const message =
    tracker.error ??
    (tracker.result?.status === "sent"
      ? `Shared ${tracker.result.accepted} stop-to-stop time${tracker.result.accepted === 1 ? "" : "s"}.${
          tracker.result.rejected.length ? ` ${tracker.result.rejected.length} failed the plausibility checks.` : ""
        }`
      : tracker.result?.message);

  return (
    <div className="fixed inset-x-0 bottom-[calc(3.75rem+env(safe-area-inset-bottom))] z-40 border-t bg-background md:bottom-0">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2.5">
        {route ? (
          <>
            <span className="size-2 shrink-0 animate-pulse rounded-full bg-live" aria-hidden="true" />
            <RoutePlate route={route} size="sm" />
            <p className="min-w-0 flex-1 text-sm">
              <span className="font-semibold">Sharing ride time</span>
              <span className="text-muted-foreground">
                {" "}
                for {formatDuration((now.getTime() - (tracker.startedAt ?? now.getTime())) / 60_000)}. Location stays on
                this phone.
              </span>
            </p>
            <Button size="sm" onClick={() => void tracker.stop(true)}>
              Done
            </Button>
            <Button size="sm" variant="ghost" onClick={() => void tracker.stop(false)}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <p className="flex-1 text-sm">{message}</p>
            <Button size="icon" variant="ghost" aria-label="Dismiss" onClick={tracker.dismissResult}>
              <X className="size-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
