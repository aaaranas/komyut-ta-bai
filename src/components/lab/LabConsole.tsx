"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ConfidenceBar, ReplayTag, StatusLabel } from "@/components/common/badges";
import { useConditions } from "@/components/providers/ConditionsProvider";
import StopCombobox from "@/components/search/StopCombobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { HazardSourceId, OfficialKind } from "@/core/hazards/types";
import { CATEGORY_POLICY, EFFECT_SIZE, POLICY_VERSION, THRESHOLDS } from "@/core/sensing/policy";
import type { LabelBasis, TruthLabel } from "@/core/sensing/types";
import { getRoute, getStop } from "@/core/transit/catalog";
import type { Stop } from "@/core/transit/types";
import { toLocalDateTimeValue } from "@/core/transit/time";
import { api, ApiError } from "@/lib/api";
import { CATEGORY_CONFIG } from "@/lib/presentation";
import { STORAGE_KEYS, readString, writeString } from "@/lib/storage";
import type { labOverview } from "@/server/lab";

type Overview = Awaited<ReturnType<typeof labOverview>>;

const pct = (value: number | null) => (value === null ? "—" : `${Math.round(value * 100)}%`);
const mins = (value: number | null) => (value === null ? "—" : `${value.toFixed(1)} min`);
const time = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" }) : "—";

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-bold">{title}</h2>
        {action}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Metric({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="border-t pt-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-2xl font-extrabold tabular-nums">{value}</p>
      {note && <p className="text-[11px] text-muted-foreground">{note}</p>}
    </div>
  );
}

const select = "h-9 rounded-md border bg-background px-2 text-sm";

export default function LabConsole() {
  const { refresh: refreshConditions } = useConditions();
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsKey, setNeedsKey] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await api.lab<Overview>());
      setError(null);
      setNeedsKey(false);
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) setNeedsKey(true);
      setError(caught instanceof Error ? caught.message : "Could not load the lab.");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const run = async (task: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await task();
      await Promise.all([load(), refreshConditions()]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  };

  if (needsKey) return <LabKeyForm onSaved={() => void load()} />;
  if (!data) {
    return (
      <p className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
        {error ?? (
          <>
            <Loader2 className="size-4 animate-spin" /> Loading…
          </>
        )}
      </p>
    );
  }

  const { verification, propagation, accuracy } = data.metrics;
  return (
    <div>
      <p className="mt-4 max-w-prose border-l-[3px] border-warn pl-3 text-sm">
        Authentication is not implemented yet. Set <code>KOMYUT_LAB_KEY</code> on any shared deployment so only
        researchers can label reports or load scenarios. Storage: {data.storage}.
      </p>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      <Section title="Objective 4 metrics">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
          <Metric label="Verification precision" value={pct(verification.precision)} note={`${verification.labeled} labeled reports`} />
          <Metric label="Verification recall" value={pct(verification.recall)} note={`${verification.false_positive} false admissions, ${verification.false_negative} false rejections`} />
          <Metric label="Propagation (median)" value={mins(propagation.median_mins)} note={`p90 ${mins(propagation.p90_mins)} over ${propagation.events} events`} />
          <Metric label="Field rides" value={String(accuracy.find((a) => a.condition === "all")?.rides ?? 0)} note="Errors by condition below" />
        </div>
        <div className="mt-3 overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Condition</th>
                <th className="px-3 py-2">Rides</th>
                <th className="px-3 py-2">Baseline MAE</th>
                <th className="px-3 py-2">Enriched MAE</th>
                <th className="px-3 py-2">Baseline MAPE</th>
                <th className="px-3 py-2">Enriched MAPE</th>
              </tr>
            </thead>
            <tbody>
              {accuracy.map((row) => (
                <tr key={row.condition} className="border-t">
                  <td className="px-3 py-2 capitalize">{row.condition}</td>
                  <td className="px-3 py-2 tabular-nums">{row.rides}</td>
                  <td className="px-3 py-2 tabular-nums">{mins(row.baseline_mae)}</td>
                  <td className="px-3 py-2 tabular-nums">{mins(row.enriched_mae)}</td>
                  <td className="px-3 py-2 tabular-nums">{pct(row.baseline_mape)}</td>
                  <td className="px-3 py-2 tabular-nums">{pct(row.enriched_mape)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="Controlled replay scenarios"
        action={
          <Button variant="outline" size="sm" disabled={busy} onClick={() => void run(() => api.labDelete("scenarios"))}>
            Clear replay data
          </Button>
        }
      >
        <ul className="grid gap-x-8 gap-y-5 md:grid-cols-2">
          {data.scenarios.map((scenario) => (
            <li key={scenario.id} className="border-t pt-3">
              <p className="text-sm font-semibold">{scenario.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{scenario.description}</p>
              <p className="mt-1 text-xs text-foreground"><strong>Expected:</strong> {scenario.expected}</p>
              <Button
                size="sm"
                className="mt-2"
                disabled={busy}
                onClick={() => void run(() => api.labPost("scenarios", { scenario_id: scenario.id }))}
              >
                Load
              </Button>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={`Events (${data.events.length})`}>
        <div className="overflow-x-auto border-y">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Event</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Confidence</th>
                <th className="px-3 py-2">Sources</th>
                <th className="px-3 py-2">First report</th>
                <th className="px-3 py-2">Published</th>
              </tr>
            </thead>
            <tbody>
              {data.events.map((event) => (
                <tr key={event.id} className="border-t align-top">
                  <td className="px-3 py-2">
                    <span className="font-medium">{CATEGORY_CONFIG[event.category].label}</span>
                    {event.blocking && <span className="ml-1 text-xs font-semibold text-destructive">blocking</span>}
                    {event.replay && <ReplayTag className="ml-1" />}
                    <p className="text-xs text-muted-foreground">
                      {getStop(event.stop_id)?.name}
                      {event.route_id ? `, ${getRoute(event.route_id)?.name}` : ""}
                    </p>
                  </td>
                  <td className="px-3 py-2"><StatusLabel status={event.status} /></td>
                  <td className="px-3 py-2"><ConfidenceBar value={event.confidence} /></td>
                  <td className="px-3 py-2 text-xs tabular-nums">
                    {event.independent_sources} indep. ({event.official_sources} official, {event.confirmations} confirm.)
                  </td>
                  <td className="px-3 py-2 text-xs tabular-nums">{time(event.first_submitted_at)}</td>
                  <td className="px-3 py-2 text-xs tabular-nums">{time(event.published_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title={`Reports & ground-truth labels (${data.reports.length})`}
        action={
          <Button variant="ghost" size="sm" onClick={() => void load()}>
            Reload
          </Button>
        }
      >
        <div className="overflow-x-auto border-y">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Report</th>
                <th className="px-3 py-2">Contributor</th>
                <th className="px-3 py-2">Submitted</th>
                <th className="px-3 py-2">Event</th>
                <th className="px-3 py-2">Label</th>
              </tr>
            </thead>
            <tbody>
              {data.reports.map((report) => (
                <tr key={report.id} className="border-t align-top">
                  <td className="px-3 py-2">
                    <span className="font-medium">{CATEGORY_CONFIG[report.category].label}</span>{" "}
                    <span className="text-xs text-muted-foreground">({report.kind})</span>
                    {report.replay && <ReplayTag className="ml-1" />}
                    <p className="text-xs text-muted-foreground">
                      {getStop(report.stop_id)?.name}
                      {report.distance_to_stop_m !== null ? `, ${report.distance_to_stop_m} m away` : ", no location"}
                    </p>
                  </td>
                  <td className="px-3 py-2 text-xs">
                    <span className="font-mono">{report.contributor.slice(0, 10)}…</span>
                    <p className="text-muted-foreground">credibility {report.credibility.toFixed(2)}</p>
                  </td>
                  <td className="px-3 py-2 text-xs tabular-nums">{time(report.submitted_at)}</td>
                  <td className="px-3 py-2"><StatusLabel status={report.event_status} /></td>
                  <td className="px-3 py-2">
                    <LabelControl
                      current={report.label?.label ?? null}
                      basis={report.label?.basis ?? "field_observation"}
                      disabled={busy}
                      onSave={(label, basis) => void run(() => api.labPost("labels", { report_id: report.id, label, basis }))}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <ValidationForm disabled={busy} onSubmit={(body) => run(() => api.labPost("validations", body))} />
        <OfficialForm disabled={busy} onSubmit={(body) => run(() => api.labPost("official", body))} />
      </div>

      <Section title={`Policy ${POLICY_VERSION} (design inputs under evaluation)`}>
        <div className="overflow-x-auto border-y">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Match window</th>
                <th className="px-3 py-2">Half-life</th>
                <th className="px-3 py-2">Max age</th>
                <th className="px-3 py-2">Needs clearance when blocking</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(CATEGORY_POLICY).map(([key, policy]) => (
                <tr key={key} className="border-t">
                  <td className="px-3 py-2">{policy.label}</td>
                  <td className="px-3 py-2 tabular-nums">{policy.match_window_mins} min</td>
                  <td className="px-3 py-2 tabular-nums">{policy.half_life_mins} min</td>
                  <td className="px-3 py-2 tabular-nums">{policy.max_age_mins} min</td>
                  <td className="px-3 py-2">{policy.clearance_required ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Thresholds: publish ≥ {THRESHOLDS.publish}, corroborated ≥ {THRESHOLDS.corroborated}, blocking ≥{" "}
          {THRESHOLDS.blocking} with ≥ {THRESHOLDS.blocking_min_independent_sources} independent sources (an
          official reading counts as one). Uncertain delays apply {EFFECT_SIZE.delay_share_uncertain * 100}% of the
          reported minutes.
        </p>
      </Section>
    </div>
  );
}

function LabelControl({
  current,
  basis,
  disabled,
  onSave,
}: {
  current: TruthLabel | null;
  basis: LabelBasis;
  disabled: boolean;
  onSave: (label: TruthLabel, basis: LabelBasis) => void;
}) {
  const [chosenBasis, setChosenBasis] = useState<LabelBasis>(basis);
  return (
    <div className="flex flex-wrap items-center gap-1">
      {(["true", "false", "unknown"] as const).map((label) => (
        <button
          key={label}
          type="button"
          disabled={disabled}
          onClick={() => onSave(label, chosenBasis)}
          className={`min-h-8 rounded-md border px-2 text-xs font-medium ${
            current === label ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent"
          }`}
        >
          {label}
        </button>
      ))}
      <select
        aria-label="Label basis"
        className={`${select} h-8 text-xs`}
        value={chosenBasis}
        onChange={(event) => setChosenBasis(event.target.value as LabelBasis)}
      >
        <option value="field_observation">field observation</option>
        <option value="official_record">official record</option>
        <option value="controlled_scenario">controlled scenario</option>
      </select>
    </div>
  );
}

function ValidationForm({ disabled, onSubmit }: { disabled: boolean; onSubmit: (body: unknown) => Promise<void> }) {
  const [origin, setOrigin] = useState<Stop | null>(null);
  const [destination, setDestination] = useState<Stop | null>(null);
  const [departAt, setDepartAt] = useState(() => toLocalDateTimeValue(new Date()));
  const [observed, setObserved] = useState("");
  const [condition, setCondition] = useState<"baseline" | "disruption">("baseline");
  return (
    <Section title="Record a field validation ride">
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (!origin || !destination) return;
          void onSubmit({
            origin_id: origin.id,
            destination_id: destination.id,
            depart_at: departAt,
            observed_mins: Number(observed),
            condition,
          }).then(() => setObserved(""));
        }}
      >
        <StopCombobox label="Boarded at" placeholder="Origin stop" value={origin} onChange={setOrigin} />
        <StopCombobox label="Arrived at" placeholder="Destination stop" value={destination} onChange={setDestination} />
        <div className="grid grid-cols-2 gap-2">
          <label className="text-sm">
            Departed (Cebu time)
            <Input type="datetime-local" value={departAt} onChange={(e) => setDepartAt(e.target.value)} className="mt-1" />
          </label>
          <label className="text-sm">
            Observed minutes
            <Input type="number" min={1} value={observed} onChange={(e) => setObserved(e.target.value)} className="mt-1" />
          </label>
        </div>
        <label className="block text-sm">
          Condition
          <select className={`${select} mt-1 w-full`} value={condition} onChange={(e) => setCondition(e.target.value as typeof condition)}>
            <option value="baseline">Baseline (normal conditions)</option>
            <option value="disruption">Disruption</option>
          </select>
        </label>
        <Button type="submit" disabled={disabled || !origin || !destination || !(Number(observed) > 0)}>
          Save ride and compute estimates
        </Button>
      </form>
    </Section>
  );
}

function OfficialForm({ disabled, onSubmit }: { disabled: boolean; onSubmit: (body: unknown) => Promise<void> }) {
  const [stop, setStop] = useState<Stop | null>(null);
  const [source, setSource] = useState<HazardSourceId>("dost_asti");
  const [kind, setKind] = useState<OfficialKind>("sensor_reading");
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [threshold, setThreshold] = useState("");
  return (
    <Section title="Enter an official record manually">
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (!stop) return;
          void onSubmit({
            source,
            kind,
            stop_id: stop.id,
            title,
            radius_km: 1,
            validity_mins: 60,
            reading_value: value,
            reading_threshold: threshold,
          }).then(() => setTitle(""));
        }}
      >
        <p className="text-xs text-muted-foreground">
          Always labeled “manually entered — not a live feed”. Only sensor readings at or above threshold count as
          flooding evidence.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <select className={select} value={source} onChange={(e) => setSource(e.target.value as HazardSourceId)} aria-label="Source">
            <option value="pagasa">PAGASA</option>
            <option value="dost_asti">DOST-ASTI</option>
            <option value="phivolcs">PHIVOLCS</option>
          </select>
          <select className={select} value={kind} onChange={(e) => setKind(e.target.value as OfficialKind)} aria-label="Kind">
            <option value="sensor_reading">Sensor reading</option>
            <option value="advisory">Advisory</option>
            <option value="hazard_context">Hazard context</option>
          </select>
        </div>
        <StopCombobox label="Nearest stop" placeholder="Area center" value={stop} onChange={setStop} />
        <Input placeholder="Title, e.g. Water level above alert" value={title} onChange={(e) => setTitle(e.target.value)} />
        {kind === "sensor_reading" && (
          <div className="grid grid-cols-2 gap-2">
            <Input type="number" step="0.1" placeholder="Water level (m)" value={value} onChange={(e) => setValue(e.target.value)} />
            <Input type="number" step="0.1" placeholder="Alert threshold (m)" value={threshold} onChange={(e) => setThreshold(e.target.value)} />
          </div>
        )}
        <Button type="submit" disabled={disabled || !stop}>
          Save record
        </Button>
      </form>
    </Section>
  );
}

function LabKeyForm({ onSaved }: { onSaved: () => void }) {
  const [key, setKey] = useState(() => readString(STORAGE_KEYS.labKey) ?? "");
  return (
    <form
      className="mt-6 max-w-sm space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        writeString(STORAGE_KEYS.labKey, key || null);
        onSaved();
      }}
    >
      <p className="flex items-center gap-2 text-sm font-semibold">
        This deployment requires a lab key
      </p>
      <Input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="KOMYUT_LAB_KEY" />
      <Button type="submit">Unlock</Button>
    </form>
  );
}
