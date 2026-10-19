"use client";

import { ReplayTag } from "@/components/common/badges";
import type { ConditionsSnapshot } from "@/core/snapshot";
import { formatAge } from "@/core/transit/time";
import { useNow } from "@/hooks/useNow";

const CONNECTION = {
  live: "Live feed",
  cached: "Cached copy",
  manual: "Entered by hand, not a live feed",
} as const;

const KIND = {
  advisory: "Advisory",
  sensor_reading: "Sensor reading",
  hazard_context: "Hazard map",
} as const;

const SOURCE_NAME = { pagasa: "PAGASA", dost_asti: "DOST-ASTI", phivolcs: "PHIVOLCS" } as const;

/**
 * Official hazard information, with each source's connection stated
 * plainly. Only sensor readings above threshold change routes.
 */
export default function HazardPanel({ hazards }: { hazards: ConditionsSnapshot["hazards"] }) {
  const now = useNow();
  return (
    <section className="mt-10" aria-labelledby="official">
      <h2 id="official" className="text-base font-bold">
        Official sources
      </h2>

      {hazards.notices.length > 0 && (
        <ul className="mt-2 divide-y border-y">
          {hazards.notices.map((notice) => (
            <li key={notice.observation_id} className="py-3">
              <p className="text-sm font-semibold">
                {notice.title}
                {notice.replay && <ReplayTag className="ml-2 align-middle" />}
              </p>
              <p className="text-sm text-muted-foreground">
                {KIND[notice.kind]} from {SOURCE_NAME[notice.source]} for {notice.area_label},{" "}
                {formatAge((now.getTime() - new Date(notice.observed_at).getTime()) / 60_000)}
              </p>
              {notice.summary && <p className="mt-1 text-sm">{notice.summary}</p>}
              <p className="mt-1 text-xs text-muted-foreground">
                {CONNECTION[notice.connection]}.{" "}
                {notice.used_as_evidence
                  ? `Counted as flooding evidence at ${notice.affected_stop_ids.length} nearby stop${notice.affected_stop_ids.length === 1 ? "" : "s"}.`
                  : "Shown for context; it doesn't change routes on its own."}
              </p>
            </li>
          ))}
        </ul>
      )}

      <dl className="mt-3 space-y-3">
        {hazards.sources.map((source) => (
          <div key={source.id} className="text-sm">
            <dt className="font-semibold">
              {source.name}{" "}
              <span className="font-normal text-muted-foreground">
                {source.status === "not_connected" ? "not connected" : source.status}
              </span>
            </dt>
            <dd className="text-muted-foreground">
              {source.products.join(", ")}.{" "}
              <a href={source.reference_url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                Official site
              </a>
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 max-w-prose text-xs text-muted-foreground">
        No live government feed is connected yet; access terms and Cebu coverage are still being confirmed. Records from
        these sources appear only when entered by hand, and are labeled that way.
      </p>
    </section>
  );
}
