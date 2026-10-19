"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { StatusLabel } from "@/components/common/badges";
import RoutePlate from "@/components/common/RoutePlate";
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
import { CATEGORY_CONFIG, STATUS_CONFIG, routeTitle } from "@/lib/presentation";
import { cn } from "@/lib/utils";

const DELAY_CHOICES = [10, 20, 30, 45];
const WHEN_CHOICES = [
  { label: "Now", minutes: 0 },
  { label: "15 min ago", minutes: 15 },
  { label: "30 min ago", minutes: 30 },
];

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-base font-bold">
        <span className="mr-2 tabular-nums text-muted-foreground">{number}</span>
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
        "inline-flex min-h-11 items-center gap-2 rounded-lg border px-3.5 text-sm font-medium transition-colors",
        selected ? "border-foreground bg-foreground text-background" : "border-input hover:bg-accent",
        className
      )}
    >
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
            {minutes === 45 ? "45 min or more" : `About ${minutes} min`}
          </Choice>
        ))}
      </div>
    );
  }
  const pair =
    category === "flooding"
      ? ([
          ["Vehicles can pass", { flood_level: "passable" }, details.flood_level === "passable"],
          ["Not passable", { flood_level: "impassable" }, details.flood_level === "impassable"],
        ] as const)
      : ([
          ["Slow traffic", { road_status: "slow" }, details.road_status === "slow"],
          ["Road closed", { road_status: "closed" }, details.road_status === "closed"],
        ] as const);
  return (
    <div className="grid grid-cols-2 gap-2">
      {pair.map(([label, value, selected]) => (
        <Choice key={label} selected={selected} onClick={() => onChange(value)} className="justify-center">
          {label}
        </Choice>
      ))}
    </div>
  );
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

  const submit = async () => {
    if (!ready || !category || !stop) return;
    setBusy(true);
    setError(null);
    try {
      const location = consent.reportLocation === "granted" ? await currentLocation() : null;
      setReceipt(
        await api.submitReport({
          category,
          stop_id: stop.id,
          route_id: needsRoute ? routeId : null,
          details,
          observed_minutes_ago: minutesAgo,
          location,
        })
      );
      void refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Couldn't send the report.");
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
      setError(caught instanceof Error ? caught.message : "Couldn't withdraw the report.");
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
      <div className="mt-8">
        <StatusLabel status={status} />
        <h2 className="mt-2 text-xl font-extrabold tracking-tight">
          {status === "withdrawn" ? "Report withdrawn" : "Salamat, bai. Report sent."}
        </h2>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          {status === "pending"
            ? `Other commuters see it once another report or an official reading agrees${
                consent.reportLocation !== "granted" ? ". Attaching your location next time makes it count more" : ""
              }.`
            : STATUS_CONFIG[status].description}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {status !== "withdrawn" && (
            <Button variant="outline" onClick={() => void withdraw()} disabled={busy}>
              Withdraw report
            </Button>
          )}
          <Button variant="outline" onClick={startOver}>
            Report something else
          </Button>
          <Button asChild variant="ghost">
            <Link href="/alerts">See alerts</Link>
          </Button>
        </div>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <Step number={1} title="What's happening?">
        <div className="grid grid-cols-2 gap-2">
          {REPORT_CATEGORIES.map((key) => {
            const config = CATEGORY_CONFIG[key];
            const selected = category === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  setCategory(key);
                  setDetails({});
                  setError(null);
                }}
                className={cn(
                  "flex min-h-[5.5rem] flex-col justify-between gap-3 rounded-xl border p-3.5 text-left transition-colors",
                  selected ? "border-foreground ring-1 ring-foreground" : "border-input hover:bg-accent"
                )}
              >
                <span style={{ color: config.hex }} aria-hidden="true">
                  <config.Icon className="size-5" />
                </span>
                <span>
                  <span className="block text-[15px] font-semibold leading-tight">{config.label}</span>
                  <span className="block text-xs text-muted-foreground">{config.prompt}</span>
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
            placeholder="Search, or use your location"
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
            <p className="text-sm text-muted-foreground">No routes in our data stop here. Pick a nearby stop.</p>
          ) : (
            <ul className="divide-y border-y">
              {servingRoutes.map((route) => {
                const selected = routeId === route.id;
                return (
                  <li key={route.id}>
                    <button
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setRouteId(route.id)}
                      className="flex min-h-12 w-full items-center gap-3 py-2 text-left"
                    >
                      <span
                        className={cn(
                          "grid size-5 shrink-0 place-items-center rounded-full border-2",
                          selected ? "border-foreground" : "border-input"
                        )}
                        aria-hidden="true"
                      >
                        {selected && <span className="size-2.5 rounded-full bg-foreground" />}
                      </span>
                      <RoutePlate route={route} size="sm" />
                      <span className="min-w-0 truncate text-sm">{routeTitle(route)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Step>
      )}

      {category && stop && routeOk && category !== "full_vehicle" && (
        <Step number={needsRoute ? 4 : 3} title={category === "delay" ? "How late?" : "How bad?"}>
          <DetailPicker category={category} details={details} onChange={setDetails} />
        </Step>
      )}

      {ready && (
        <section className="mt-8 border-t pt-6">
          <p className="text-sm font-semibold">When did you see it?</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {WHEN_CHOICES.map((choice) => (
              <Choice key={choice.minutes} selected={minutesAgo === choice.minutes} onClick={() => setMinutesAgo(choice.minutes)}>
                {choice.label}
              </Choice>
            ))}
          </div>

          <label className="mt-5 flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              className="mt-0.5 size-5 accent-[var(--foreground)]"
              checked={consent.reportLocation === "granted"}
              onChange={(event) => updateConsent({ reportLocation: event.target.checked ? "granted" : "denied" })}
            />
            <span>
              <span className="block font-medium">Attach my location</span>
              <span className="block text-muted-foreground">
                Shows you&apos;re there, so the report counts more. Only your distance from the stop is kept.
              </span>
            </span>
          </label>

          <Button size="lg" className="mt-6 w-full" disabled={busy} onClick={() => void submit()}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            Send report
          </Button>
          {error && (
            <p className="mt-3 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
