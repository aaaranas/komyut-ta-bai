"use client";

import { CloudRain } from "lucide-react";
import { ForecastTag, OpenMeteoAttribution } from "@/components/common/badges";
import { FORECAST_ALPHA, RAINFALL_LEVEL_LABEL, RAINFALL_SAMPLE_POINTS, type WeatherSnapshot } from "@/core/hazards/rainfall";
import { formatAge } from "@/core/transit/time";
import { useNow } from "@/hooks/useNow";

const LEVEL_TONE = { yellow: "#C9A100", orange: "#E07B00", red: "#D0302F" } as const;

/** Rainfall forecast for Metro Cebu, kept visibly apart from reports and official records. */
export default function WeatherPanel({ weather }: { weather: WeatherSnapshot | null }) {
  const now = useNow();
  if (!weather || weather.status === "disabled") return null;
  const age = weather.fetched_at ? formatAge((now.getTime() - new Date(weather.fetched_at).getTime()) / 60_000) : null;
  const labelOf = new Map(RAINFALL_SAMPLE_POINTS.map((p) => [p.id, p.label]));
  const wettest = [...weather.readings]
    .filter((r) => r.hour_mm !== null)
    .sort((a, b) => (b.hour_mm ?? 0) - (a.hour_mm ?? 0))[0];

  return (
    <section className="mt-10" aria-labelledby="weather">
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="weather" className="text-base font-bold">
          Rainfall forecast
        </h2>
        <ForecastTag />
      </div>

      {weather.status === "unavailable" ? (
        <p className="mt-2 text-sm text-muted-foreground">
          The forecast can&apos;t be reached right now
          {age ? `; the last one was fetched ${age} and is not used for routes` : ""}.
        </p>
      ) : weather.alerts.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          No heavy rain forecast for this hour.
          {wettest && wettest.hour_mm !== null && wettest.hour_mm > 0
            ? ` Wettest: ${labelOf.get(wettest.point_id)}, ${wettest.hour_mm.toFixed(1)} mm.`
            : ""}
        </p>
      ) : (
        <ul className="mt-2 divide-y border-y">
          {weather.alerts.map((alert) => (
            <li key={alert.id} className="flex gap-3 py-3">
              <CloudRain className="mt-0.5 size-4 shrink-0" style={{ color: LEVEL_TONE[alert.level] }} aria-hidden="true" />
              <div className="text-sm">
                <p className="font-semibold">
                  {RAINFALL_LEVEL_LABEL[alert.level]} forecast near {alert.label}
                </p>
                <p className="text-muted-foreground">
                  {alert.mm_per_hour.toFixed(1)} mm this hour
                  {alert.probability_pct !== null ? `, ${alert.probability_pct}% chance` : ""}. PAGASA{" "}
                  {alert.level} level. Trip estimates nearby are about {Math.round(FORECAST_ALPHA[alert.level] * 100)}%
                  longer; roads are never closed on a forecast alone.
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 flex flex-wrap gap-x-2 text-xs text-muted-foreground">
        {weather.status === "ok" && age && <span>Updated {age}.</span>}
        <OpenMeteoAttribution />
        <span>(CC BY 4.0)</span>
      </p>
    </section>
  );
}

/** One-line forecast summary for the home screen; nothing when there's no alert. */
export function WeatherLine({ weather }: { weather: WeatherSnapshot | null }) {
  if (!weather || weather.status !== "ok" || weather.alerts.length === 0) return null;
  const worst = [...weather.alerts].sort((a, b) => b.mm_per_hour - a.mm_per_hour)[0];
  const others = weather.alerts.length - 1;
  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
      <CloudRain className="size-4" style={{ color: LEVEL_TONE[worst.level] }} aria-hidden="true" />
      <span>
        {RAINFALL_LEVEL_LABEL[worst.level]} forecast near {worst.label}
        {others > 0 ? ` and ${others} more area${others === 1 ? "" : "s"}` : ""}.
      </span>
      <ForecastTag />
      <OpenMeteoAttribution />
    </div>
  );
}
