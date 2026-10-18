"use client";

import { Check, Loader2, MapPin, RotateCcw, Send, Undo2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/common/badges";
import { useConditions } from "@/components/providers/ConditionsProvider";
import StopCombobox from "@/components/search/StopCombobox";
import { Button } from "@/components/ui/button";
import { CATEGORY_POLICY } from "@/core/sensing/policy";
import { REPORT_CATEGORIES, type ReportCategory, type ReportDetails } from "@/core/sensing/types";
import { getRoute, getStop, routesAt } from "@/core/transit/catalog";
import type { Stop } from "@/core/transit/types";
import { updateConsent, useConsent } from "@/hooks/useConsent";
import { api, type ReportReceipt } from "@/lib/api";
import { currentLocation } from "@/lib/location";
import { CATEGORY_CONFIG, MODE_CONFIG, STATUS_CONFIG } from "@/lib/presentation";
import { cn } from "@/lib/utils";

const DELAY_CHOICES = [10, 20, 30, 45];
const WHEN_CHOICES = [
  { label: "Now", minutes: 0 },
  { label: "15 min ago", minutes: 15 },
  { label: "30 min ago", minutes: 30 },
];

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <span className="grid size-6 place-items-center rounded-full bg-primary text-xs text-primary-foreground">
          {number}
        </span>
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Choice({
  selected,
  onClick,
  children,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border px-3.5 text-sm font-medium transition-colors",
        selected ? "border-primary bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-accent",
        className
      )}
    >
      {selected && <Check className="size-4" />}
      {children}
    </button>
  );
}

function DetailPicker({
  category,
  details,
  onChange,
}: {
  category: ReportCategory;
  details: ReportDetails;
  onChange: (details: ReportDetails) => void;
}) {
  if (category === "delay") {
    return (
      <div className="flex flex-wrap gap-2">
        {DELAY_CHOICES.map((minutes) => (
          <Choice key={minutes} selected={details.delay_mins === minutes} onClick={() => onChange({ delay_mins: minutes })}>
            {minutes === 45 ? "45+ min" : `~${minutes} min`}
          </Choice>
        ))}
      </div>
    );
  }
  if (category === "flooding") {
    return (
      <div className="grid grid-cols-2 gap-2">
        <Choice selected={details.flood_level === "passable"} onClick={() => onChange({ flood_level: "passable" })}>
          Vehicles can pass
        </Choice>
        <Choice selected={details.flood_level === "impassable"} onClick={() => onChange({ flood_level: "impassable" })}>
          Not passable
        </Choice>
      </div>
    );
  }
  if (category === "road_disruption") {
    return (
      <div className="grid grid-cols-2 gap-2">
        <Choice selected={details.road_status === "slow"} onClick={() => onChange({ road_status: "slow" })}>
          Slow traffic
        </Choice>
        <Choice selected={details.road_status === "closed"} onClick={() => onChange({ road_status: "closed" })}>
          Road closed
        </Choice>
      </div>
    );
  }
  return null;
}

function detailsComplete(category: ReportCategory, details: ReportDetails): boolean {
  if (category === "delay") return details.delay_mins !== undefined;
  if (category === "flooding") return details.flood_level !== undefined;
  if (category === "road_disruption") return details.road_status !== undefined;
  return true;
}

export default function ReportFlow() {
  const params = useSearchParams();
  const consent = useConsent();
  const { refresh } = useConditions();
  const initialCategory = params.get("category");
  const [category, setCategory] = useState<ReportCategory | null>(
    REPORT_CATEGORIES.includes(initialCategory as ReportCategory) ? (initialCategory as ReportCategory) : null
  );
  const [stop, setStop] = useState<Stop | null>(() => getStop(params.get("stop") ?? "") ?? null);
  const [routeId, setRouteId] = useState<string | null>(() => getRoute(params.get("route") ?? "")?.id ?? null);
  const [details, setDetails] = useState<ReportDetails>({});
  const [minutesAgo, setMinutesAgo] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<ReportReceipt | null>(null);

  const servingRoutes = useMemo(() => (stop ? routesAt(stop.id) : []), [stop]);
  const needsRoute = category ? CATEGORY_POLICY[category].requires_route : false;
  const routeOk = !needsRoute || (routeId !== null && servingRoutes.some((route) => route.id === routeId));
  const ready = category !== null && stop !== null && routeOk && detailsComplete(category, details);

  const pickCategory = (next: ReportCategory) => {
    setCategory(next);
    setDetails({});
    setError(null);
  };

  const submit = async () => {
    if (!ready || !category || !stop) return;
    setBusy(true);
    setError(null);
    try {
      const location = consent.reportLocation === "granted" ? await currentLocation() : null;
      const result = await api.submitReport({
        category,
        stop_id: stop.id,
        route_id: needsRoute ? routeId : null,
        details,
        observed_minutes_ago: minutesAgo,
        location,
      });
      setReceipt(result);
      void refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not send the report.");
    } finally {
      setBusy(false);
    }
  };

  const withdraw = async () => {
    if (!receipt) return;
    setBusy(true);
    try {
      setReceipt(await api.withdrawReport(receipt.report.id));
      void refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not withdraw.");
    } finally {
      setBusy(false);
    }
  };

  const startOver = () => {
    setReceipt(null);
    setCategory(null);
    setDetails({});
    setMinutesAgo(0);
    setError(null);
  };

  if (receipt) {
    const status = receipt.event_status;
    return (
      <div className="mt-6 rounded-2xl border bg-card p-5">
        <StatusBadge status={status} />
        <h2 className="mt-3 text-lg font-bold text-foreground">
          {status === "withdrawn" ? "Report withdrawn" : "Salamat, bai! Report received."}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{STATUS_CONFIG[status].description}</p>
        {status === "pending" && (
          <p className="mt-2 text-sm text-muted-foreground">
            Reports are checked before others see them. Yours is published once another commuter or an official
            reading agrees{consent.reportLocation !== "granted" ? ", or sooner if you attach your location" : ""}.
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {status !== "withdrawn" && (
            <Button variant="outline" onClick={() => void withdraw()} disabled={busy}>
              <Undo2 className="size-4" />
              Withdraw report
            </Button>
          )}
          <Button variant="outline" onClick={startOver}>
            <RotateCcw className="size-4" />
            Report something else
          </Button>
          <Button asChild variant="ghost">
            <Link href="/alerts">See live alerts</Link>
          </Button>
        </div>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <Step number={1} title="What's happening?">
        <div className="grid grid-cols-2 gap-2.5">
          {REPORT_CATEGORIES.map((key) => {
            const config = CATEGORY_CONFIG[key];
            const selected = category === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={selected}
                onClick={() => pickCategory(key)}
                className={cn(
                  "flex min-h-24 flex-col items-start gap-2 rounded-2xl border-2 p-3.5 text-left transition",
                  selected ? `${config.tone} border-current` : "border-transparent bg-card shadow-sm ring-1 ring-border hover:bg-accent"
                )}
              >
                <span className={cn("grid size-9 place-items-center rounded-xl", config.solid)}>
                  <config.Icon className="size-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{config.label}</span>
                  <span className="block text-xs opacity-75">{config.prompt}</span>
                </span>
              </button>
            );
          })}
        </div>
      </Step>

      {category && (
        <Step number={2} title="Where?">
          <StopCombobox
            label="Nearest stop"
            placeholder="Search or tap the target to find stops near you"
            value={stop}
            onChange={(next) => {
              setStop(next);
              if (next && routeId && !routesAt(next.id).some((route) => route.id === routeId)) setRouteId(null);
            }}
          />
        </Step>
      )}

      {category && stop && needsRoute && (
        <Step number={3} title="Which ride?">
          {servingRoutes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No routes in our data stop here. Try a nearby stop.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {servingRoutes.map((route) => {
                const mode = MODE_CONFIG[route.mode];
                return (
                  <Choice
                    key={route.id}
                    selected={routeId === route.id}
                    onClick={() => setRouteId(route.id)}
                    className="justify-start text-left"
                  >
                    <mode.Icon className="size-4 shrink-0" />
                    <span className="truncate">{route.name}</span>
                  </Choice>
                );
              })}
            </div>
          )}
        </Step>
      )}

      {category && stop && routeOk && category !== "full_vehicle" && (
        <Step number={needsRoute ? 4 : 3} title={category === "delay" ? "How late?" : "How bad?"}>
          <DetailPicker category={category} details={details} onChange={setDetails} />
        </Step>
      )}

      {ready && (
        <section className="mt-6 rounded-2xl border bg-muted/40 p-4">
          <p className="text-sm font-medium text-foreground">When did you see it?</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {WHEN_CHOICES.map((choice) => (
              <Choice key={choice.minutes} selected={minutesAgo === choice.minutes} onClick={() => setMinutesAgo(choice.minutes)}>
                {choice.label}
              </Choice>
            ))}
          </div>

          <label className="mt-4 flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              className="mt-0.5 size-5 accent-[var(--primary)]"
              checked={consent.reportLocation === "granted"}
              onChange={(event) => updateConsent({ reportLocation: event.target.checked ? "granted" : "denied" })}
            />
            <span>
              <span className="flex items-center gap-1 font-medium text-foreground">
                <MapPin className="size-3.5" />
                Attach my location
              </span>
              <span className="text-xs text-muted-foreground">
                Shows you&apos;re on site, so your report counts more. Only your distance from the stop is kept —
                never your coordinates.
              </span>
            </span>
          </label>

          <Button size="lg" className="mt-4 w-full font-semibold" disabled={busy} onClick={() => void submit()}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Send report
          </Button>
          {error && <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>}
        </section>
      )}
    </div>
  );
}
