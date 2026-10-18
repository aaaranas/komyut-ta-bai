"use client";

import { Fingerprint, FlaskConical, Loader2, MapPin, RefreshCw, Route, ShieldCheck, Trash2, Undo2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { StatusBadge } from "@/components/common/badges";
import { useConditions } from "@/components/providers/ConditionsProvider";
import { Button } from "@/components/ui/button";
import { getRoute, getStop } from "@/core/transit/catalog";
import { formatAge } from "@/core/transit/time";
import { updateConsent, useConsent } from "@/hooks/useConsent";
import { useNow } from "@/hooks/useNow";
import { api, resetDeviceId, type ContributorSummary } from "@/lib/api";
import { CATEGORY_CONFIG } from "@/lib/presentation";
import { cn } from "@/lib/utils";

function Toggle({
  checked,
  onChange,
  title,
  description,
  Icon,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  description: string;
  Icon: typeof MapPin;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border bg-card p-4">
      <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-foreground">{title}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>
      </span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 size-5 shrink-0 accent-[var(--primary)]"
      />
    </label>
  );
}

const COLLECTED = [
  "Report category, stop, ride (for delays and full vehicles), and when you saw it.",
  "If you attach location: only your distance from the stop, rounded to 10 m. Coordinates are discarded on arrival.",
  "If you share ride times: stop-to-stop durations computed on your phone. Raw GPS points never leave the device.",
  "A pseudonym — a salted hash of a random ID made on this phone. No name, number, or account.",
  "Reports are kept 90 days and ride times 30 days, then deleted automatically.",
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
      setError(caught instanceof Error ? caught.message : "Could not load your contributions.");
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

  const newIdentity = async () => {
    resetDeviceId();
    await load();
  };

  const reputation = summary?.reputation;
  const labeled = reputation ? reputation.positive + reputation.negative : 0;

  return (
    <div className="mt-6 space-y-8">
      <section>
        <h2 className="text-base font-semibold text-foreground">Your choices</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Trip planning works without either. You can change these any time.
        </p>
        <div className="mt-3 space-y-2">
          <Toggle
            Icon={MapPin}
            title="Attach my location to reports"
            description="Shows you're on site, which gives your reports more weight."
            checked={consent.reportLocation === "granted"}
            onChange={(checked) => updateConsent({ reportLocation: checked ? "granted" : "denied" })}
          />
          <Toggle
            Icon={Route}
            title="Share ride times"
            description="Adds a “Share ride time” button to each ride in your trip plan. Tracing runs only while you ride and stops when you tap Done."
            checked={consent.rideTraces}
            onChange={(checked) => updateConsent({ rideTraces: checked })}
          />
        </div>
      </section>

      <section>
        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
          <ShieldCheck className="size-4 text-primary" />
          What is collected
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {COLLECTED.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Fingerprint className="size-4 text-primary" />
          Your pseudonym
        </h2>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        {!summary && !error ? (
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Loading…
          </p>
        ) : summary ? (
          <div className="mt-3 rounded-xl border bg-card p-4 text-sm">
            <p className="font-mono text-xs text-muted-foreground">{summary.contributor}</p>
            <p className="mt-2 text-foreground">
              Reliability score <strong>{reputation!.score.toFixed(2)}</strong>{" "}
              <span className="text-muted-foreground">
                {labeled < 0.5
                  ? "— new contributors start at 0.50; it changes only when reports are independently checked."
                  : `from ${Math.round(labeled)} independently checked report(s).`}
              </span>
            </p>
            <p className="mt-1 text-muted-foreground">
              {summary.reports.length} report(s) · {summary.ride_segments} shared ride segment(s)
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => void newIdentity()}>
                <RefreshCw className="size-3.5" />
                Start a new pseudonym
              </Button>
              <Button
                variant={confirmErase ? "destructive" : "outline"}
                size="sm"
                disabled={busy}
                onClick={() => void erase()}
              >
                <Trash2 className="size-3.5" />
                {confirmErase ? "Tap again to delete everything" : "Delete all my contributions"}
              </Button>
            </div>
          </div>
        ) : null}
      </section>

      {summary && summary.reports.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-foreground">Your reports</h2>
          <ul className="mt-3 divide-y overflow-hidden rounded-xl border bg-card">
            {summary.reports.map(({ report, event_status }) => {
              const config = CATEGORY_CONFIG[report.category];
              const route = report.route_id ? getRoute(report.route_id) : undefined;
              return (
                <li key={report.id} className="flex items-start gap-3 p-3">
                  <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", config.solid)}>
                    <config.Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {report.kind === "observation" ? config.label : `${config.label} (${report.kind})`} ·{" "}
                      {getStop(report.stop_id)?.name ?? report.stop_id}
                    </p>
                    {route && <p className="truncate text-xs text-muted-foreground">{route.name}</p>}
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {formatAge((now.getTime() - new Date(report.submitted_at).getTime()) / 60_000)}
                      <StatusBadge status={event_status} />
                    </p>
                  </div>
                  {event_status !== "withdrawn" && (
                    <Button variant="ghost" size="sm" disabled={busy} onClick={() => void withdraw(report.id)}>
                      <Undo2 className="size-3.5" />
                      Withdraw
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <FlaskConical className="size-3.5" />
        Researchers: evaluation tools are in the{" "}
        <Link href="/lab" className="font-medium text-primary hover:underline">
          research console
        </Link>
        .
      </p>
    </div>
  );
}
