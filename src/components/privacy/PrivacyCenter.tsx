"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { StatusLabel } from "@/components/common/badges";
import RoutePlate from "@/components/common/RoutePlate";
import { useConditions } from "@/components/providers/ConditionsProvider";
import { Button } from "@/components/ui/button";
import { getRoute, getStop } from "@/core/transit/catalog";
import { formatAge } from "@/core/transit/time";
import { updateConsent, useConsent } from "@/hooks/useConsent";
import { useNow } from "@/hooks/useNow";
import { api, resetDeviceId, type ContributorSummary } from "@/lib/api";
import { CATEGORY_CONFIG } from "@/lib/presentation";

function Toggle({
  checked,
  onChange,
  title,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  description: string;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-6 py-3.5">
      <span>
        <span className="block text-[15px] font-semibold">{title}</span>
        <span className="mt-0.5 block text-sm text-muted-foreground">{description}</span>
      </span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 size-5 shrink-0 accent-[var(--foreground)]"
      />
    </label>
  );
}

const COLLECTED = [
  "For each report: the type, the stop, the ride (for delays and full vehicles), and when you saw it.",
  "If you attach location: only your distance from the stop, rounded to 10 m. Coordinates are thrown away on arrival.",
  "If you share ride times: stop-to-stop durations worked out on your phone. Raw GPS points never leave it.",
  "A pseudonym made from a random ID on this phone. No name, number, or account.",
  "Reports are deleted after 90 days and ride times after 30.",
];

export default function PrivacyCenter() {
  const consent = useConsent();
  const now = useNow();
  const { refresh: refreshConditions } = useConditions();
  const [summary, setSummary] = useState<ContributorSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmErase, setConfirmErase] = useState(false);

  const load = useCallback(async () => {
    try {
      setSummary(await api.me());
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Couldn't load your contributions.");
    }
  }, []);

  useEffect(() => {
    // Fetch on mount; the device id only exists in the browser.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const withdraw = async (id: string) => {
    setBusy(true);
    try {
      await api.withdrawReport(id);
      await Promise.all([load(), refreshConditions()]);
    } finally {
      setBusy(false);
    }
  };

  const erase = async () => {
    if (!confirmErase) {
      setConfirmErase(true);
      return;
    }
    setBusy(true);
    try {
      await api.eraseMe();
      setConfirmErase(false);
      await Promise.all([load(), refreshConditions()]);
    } finally {
      setBusy(false);
    }
  };

  const reputation = summary?.reputation;
  const labeled = reputation ? reputation.positive + reputation.negative : 0;

  return (
    <div className="mt-8 space-y-10">
      <section aria-labelledby="choices">
        <h2 id="choices" className="text-base font-bold">
          Your choices
        </h2>
        <p className="text-sm text-muted-foreground">Trip planning works with both off.</p>
        <div className="mt-2 divide-y border-y">
          <Toggle
            title="Attach my location to reports"
            description="Shows you're there, so your reports count more."
            checked={consent.reportLocation === "granted"}
            onChange={(checked) => updateConsent({ reportLocation: checked ? "granted" : "denied" })}
          />
          <Toggle
            title="Share ride times"
            description="Adds “Share ride time” to each ride in a trip. It runs only while you ride and stops when you tap Done."
            checked={consent.rideTraces}
            onChange={(checked) => updateConsent({ rideTraces: checked })}
          />
        </div>
      </section>

      <section aria-labelledby="collected">
        <h2 id="collected" className="text-base font-bold">
          What is kept
        </h2>
        <ul className="mt-2 max-w-prose list-disc space-y-1.5 pl-5 text-sm text-muted-foreground marker:text-input">
          {COLLECTED.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="pseudonym">
        <h2 id="pseudonym" className="text-base font-bold">
          Your pseudonym
        </h2>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        {!summary && !error ? (
          <p className="mt-2 text-sm text-muted-foreground">Loading…</p>
        ) : summary ? (
          <div className="mt-2 text-sm">
            <p className="break-all font-medium">{summary.contributor}</p>
            <p className="mt-2 max-w-prose text-muted-foreground">
              Reliability {reputation!.score.toFixed(2)}.{" "}
              {labeled < 0.5
                ? "Everyone starts at 0.50; it changes only when a report is checked independently."
                : `Based on ${Math.round(labeled)} independently checked report${Math.round(labeled) === 1 ? "" : "s"}.`}{" "}
              {summary.reports.length} report{summary.reports.length === 1 ? "" : "s"} and {summary.ride_segments} shared
              ride segment{summary.ride_segments === 1 ? "" : "s"}.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  resetDeviceId();
                  void load();
                }}
              >
                Start a new pseudonym
              </Button>
              <Button variant={confirmErase ? "destructive" : "outline"} size="sm" disabled={busy} onClick={() => void erase()}>
                {confirmErase ? "Tap again to delete everything" : "Delete all my contributions"}
              </Button>
            </div>
          </div>
        ) : null}
      </section>

      {summary && summary.reports.length > 0 && (
        <section aria-labelledby="reports">
          <h2 id="reports" className="text-base font-bold">
            Your reports
          </h2>
          <ul className="mt-2 divide-y border-y">
            {summary.reports.map(({ report, event_status }) => {
              const config = CATEGORY_CONFIG[report.category];
              const route = report.route_id ? getRoute(report.route_id) : undefined;
              return (
                <li key={report.id} className="flex items-start gap-3 py-3">
                  <span className="mt-1.5 size-2.5 shrink-0 rounded-full" style={{ backgroundColor: config.hex }} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      {report.kind === "observation" ? config.label : `${config.label} (${report.kind})`}
                      {route && <RoutePlate route={route} size="sm" className="ml-2 align-middle" />}
                    </p>
                    <p className="text-sm text-muted-foreground">{getStop(report.stop_id)?.name ?? report.stop_id}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {formatAge((now.getTime() - new Date(report.submitted_at).getTime()) / 60_000)}
                      <StatusLabel status={event_status} />
                    </p>
                  </div>
                  {event_status !== "withdrawn" && (
                    <Button variant="ghost" size="sm" disabled={busy} onClick={() => void withdraw(report.id)}>
                      Withdraw
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <p className="text-sm text-muted-foreground">
        Researchers: evaluation tools are in the{" "}
        <Link href="/lab" className="font-medium text-foreground underline underline-offset-4">
          research console
        </Link>
        .
      </p>
    </div>
  );
}
