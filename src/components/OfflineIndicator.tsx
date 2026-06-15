"use client";

import { WifiOff } from "lucide-react";
import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

export default function OfflineIndicator() {
  const online = useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true // assume online during prerender
  );

  if (online) return null;

  return (
    <div className="flex items-center justify-center gap-1.5 bg-foreground px-4 py-2 text-center text-xs font-medium text-background">
      <WifiOff className="size-3.5" />
      You&apos;re offline — showing saved routes and plans.
    </div>
  );
}
