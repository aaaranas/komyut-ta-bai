"use client";

import { Building2, ExternalLink, PlugZap, TriangleAlert } from "lucide-react";
import { ReplayBadge } from "@/components/common/badges";
import type { ConditionsSnapshot } from "@/core/snapshot";
import { formatAge } from "@/core/transit/time";
import { useNow } from "@/hooks/useNow";

const CONNECTION_LABEL = {
  live: "Live feed",
  cached: "Cached copy",
  manual: "Manually entered — not a live feed",
} as const;

const KIND_LABEL = {
  advisory: "Advisory (context)",
  sensor_reading: "Sensor reading",
  hazard_context: "Hazard susceptibility (static context)",
} as const;

/**
 * Official hazard information, with each source's connection status stated
 * plainly. Advisories and susceptibility maps contextualize; only sensor
 * readings above threshold count as evidence of current flooding.
 */
export default function HazardPanel({ hazards }: { hazards: ConditionsSnapshot["hazards"] }) {
  const now = useNow();
  return (
    <section className="mt-8">
      <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
        <Building2 className="size-4 text-primary" />
        Official hazard information
      </h2>

      {hazards.notices.length > 0 && (
        <ul className="mt-3 space-y-2">
          {hazards.notices.map((notice) => (
            <li key={notice.observation_id} className="rounded-xl border bg-card p-3.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <TriangleAlert className="size-4 text-amber-600" />
                <p className="text-sm font-semibold text-foreground">{notice.title}</p>
                {notice.replay && <ReplayBadge />}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {notice.source.toUpperCase().replace("_", "-")} · {KIND_LABEL[notice.kind]} · {notice.area_label} ·{" "}
                {formatAge((now.getTime() - new Date(notice.observed_at).getTime()) / 60_000)}
              </p>
              {notice.summary && <p className="mt-1 text-sm text-foreground">{notice.summary}</p>}
              <p className="mt-1 text-xs font-medium text-amber-700 dark:text-amber-300">{CONNECTION_LABEL[notice.connection]}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {notice.used_as_evidence
                  ? `Counted as flooding evidence at ${notice.affected_stop_ids.length} nearby stop(s).`
                  : "Shown for context only; it does not change routes by itself."}
              </p>
            </li>
          ))}
        </ul>
      )}

      <ul className="mt-3 grid gap-2 sm:grid-cols-3">
        {hazards.sources.map((source) => (
          <li key={source.id} className="rounded-xl border bg-muted/40 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">{source.name}</p>
              <span className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                <PlugZap className="size-3" />
                {source.status === "not_connected" ? "Not connected" : source.status}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{source.products.join(" · ")}</p>
            <p className="mt-1.5 text-[11px] text-muted-foreground">{source.disclosure}</p>
            <a
              href={source.reference_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Official site
              <ExternalLink className="size-3" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
