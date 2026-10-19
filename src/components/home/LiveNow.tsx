"use client";

import Link from "next/link";
import EventRow from "@/components/alerts/EventRow";
import { useConditions } from "@/components/providers/ConditionsProvider";
import { Button } from "@/components/ui/button";

const SHOWN = 4;

/** The most confident live events, then the way to add one. */
export default function LiveNow() {
  const { snapshot, status } = useConditions();
  const events = [...(snapshot?.events ?? [])].sort((a, b) => b.confidence - a.confidence);

  return (
    <section aria-labelledby="live-now">
      <div className="flex items-baseline justify-between">
        <h2 id="live-now" className="text-base font-bold">
          Live now
        </h2>
        {events.length > 0 && (
          <Link href="/alerts" className="text-sm text-muted-foreground hover:text-foreground">
            All {events.length} alerts
          </Link>
        )}
      </div>

      {status === "loading" ? (
        <p className="py-3 text-sm text-muted-foreground">Checking conditions…</p>
      ) : status === "unavailable" ? (
        <p className="py-3 text-sm text-muted-foreground">
          Live conditions can&apos;t be reached. Trip plans still work from route data.
        </p>
      ) : events.length === 0 ? (
        <p className="py-3 text-sm text-muted-foreground">No verified reports right now.</p>
      ) : (
        <ul className="divide-y">
          {events.slice(0, SHOWN).map((event) => (
            <li key={event.id}>
              <EventRow event={event} variant="brief" />
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex items-center justify-between gap-4 rounded-xl bg-muted px-4 py-3.5">
        <p className="text-sm">
          <span className="font-semibold">On the road and something&apos;s wrong?</span>{" "}
          <span className="text-muted-foreground">Report a delay, flood, full ride, or road problem.</span>
        </p>
        <Button asChild size="sm" className="shrink-0">
          <Link href="/report">Report</Link>
        </Button>
      </div>
    </section>
  );
}
