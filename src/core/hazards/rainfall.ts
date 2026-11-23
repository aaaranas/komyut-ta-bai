import type { ConditionEffect, EffectTarget } from "@/core/planner/conditions";
import { haversineKm } from "@/core/transit/geo";
import { ROAD_MODES, type Stop } from "@/core/transit/types";

/**
 * PAGASA color-coded rainfall warning system (Heavy Rainfall Warning):
 * yellow = heavy rain, 7.5–15 mm in one hour; orange = intense rain,
 * 15–30 mm; red = torrential rain, 30 mm or more. Below 7.5 mm, no warning.
 */
export const PAGASA_RAINFALL_THRESHOLDS = { yellow: 7.5, orange: 15, red: 30 } as const;

export type RainfallLevel = keyof typeof PAGASA_RAINFALL_THRESHOLDS;

export const RAINFALL_LEVEL_LABEL: Record<RainfallLevel, string> = {
  yellow: "Heavy rain",
  orange: "Intense rain",
  red: "Torrential rain",
};

export function rainfallLevel(mmPerHour: number): RainfallLevel | null {
  if (!Number.isFinite(mmPerHour)) return null;
  if (mmPerHour >= PAGASA_RAINFALL_THRESHOLDS.red) return "red";
  if (mmPerHour >= PAGASA_RAINFALL_THRESHOLDS.orange) return "orange";
  if (mmPerHour >= PAGASA_RAINFALL_THRESHOLDS.yellow) return "yellow";
  return null;
}

/**
 * Severity factor a forecast applies to road and foot edges near its sample
 * point: w = w₀ · (1 + α). Deliberately small, and a forecast can never close
 * an edge — only verified reports or official observations can.
 */
export const FORECAST_ALPHA: Record<RainfallLevel, number> = { yellow: 0.05, orange: 0.1, red: 0.15 };

export interface RainfallSamplePoint {
  id: string;
  label: string;
  lat: number;
  lng: number;
  /** Stops within this distance take the point's forecast. */
  radius_km: number;
  /** Evaluation corridor the point stands for, when it is one. */
  corridor?: string;
}

/** One point per evaluation corridor, plus points spread over Metro Cebu. */
export const RAINFALL_SAMPLE_POINTS: readonly RainfallSamplePoint[] = [
  { id: "cebu-downtown", label: "Downtown Cebu City", lat: 10.2958, lng: 123.9015, radius_km: 3, corridor: "Colon–Fuente" },
  { id: "cebu-uptown", label: "Uptown Cebu City", lat: 10.3307, lng: 123.9054, radius_km: 3, corridor: "Ayala–IT Park" },
  { id: "mandaue", label: "Mandaue City", lat: 10.3236, lng: 123.9423, radius_km: 3.5, corridor: "Cebu–Mandaue" },
  { id: "lapu-lapu", label: "Lapu-Lapu City", lat: 10.3103, lng: 123.96, radius_km: 4, corridor: "Mactan–Cebu" },
  { id: "talisay", label: "Talisay City", lat: 10.2447, lng: 123.8494, radius_km: 3.5, corridor: "South Road" },
  { id: "minglanilla-naga", label: "Minglanilla and Naga", lat: 10.2122, lng: 123.7758, radius_km: 5 },
  { id: "consolacion-liloan", label: "Consolacion and Liloan", lat: 10.3906, lng: 123.9777, radius_km: 5, corridor: "North Road" },
  { id: "danao", label: "Danao City", lat: 10.5203, lng: 124.027, radius_km: 5 },
  { id: "carcar", label: "Carcar City", lat: 10.1061, lng: 123.6404, radius_km: 5 },
];

/** What one sample point reported in one Open-Meteo response. */
export interface RainfallReading {
  point_id: string;
  /** Precipitation over the preceding 15 minutes (Open-Meteo `current`). */
  current_mm: number | null;
  weather_code: number | null;
  /** Forecast mm for the hour now in progress (hourly sums are preceding-hour). */
  hour_mm: number | null;
  hour_probability_pct: number | null;
  /** Local hour the forecast refers to, "YYYY-MM-DDTHH:00" (Asia/Manila). */
  hour: string | null;
  /** Highest hourly mm forecast for the next 3 hours. */
  peak_3h_mm: number | null;
}

const MANILA_OFFSET_MS = 8 * 3_600_000;

/** Local Manila hour stamp ("YYYY-MM-DDTHH:00") at which an hourly sum ending after `now` closes. */
export function closingHourOf(now: Date): string {
  const local = new Date(now.getTime() + MANILA_OFFSET_MS + 3_600_000);
  return `${local.toISOString().slice(0, 13)}:00`;
}

const num = (value: unknown): number | null => (typeof value === "number" && Number.isFinite(value) ? value : null);

interface OpenMeteoLocation {
  current?: { precipitation?: unknown; weather_code?: unknown };
  hourly?: { time?: unknown; precipitation?: unknown; precipitation_probability?: unknown };
}

/**
 * Parses an Open-Meteo forecast response (one object, or an array with one
 * object per requested coordinate in request order). Throws when the shape
 * is not what was requested, so a malformed reply is "unavailable", never
 * read as zero rainfall.
 */
export function parseOpenMeteo(body: unknown, points: readonly RainfallSamplePoint[], now: Date): RainfallReading[] {
  const locations = (Array.isArray(body) ? body : [body]) as OpenMeteoLocation[];
  if (locations.length !== points.length) {
    throw new Error(`Expected ${points.length} locations, got ${locations.length}`);
  }
  const closing = closingHourOf(now);
  return points.map((point, index) => {
    const location = locations[index];
    const hourly = location?.hourly;
    if (!location || !hourly || !Array.isArray(hourly.time) || !Array.isArray(hourly.precipitation)) {
      throw new Error(`Missing hourly precipitation for ${point.id}`);
    }
    const times = hourly.time as unknown[];
    const precipitation = hourly.precipitation as unknown[];
    const probability = Array.isArray(hourly.precipitation_probability)
      ? (hourly.precipitation_probability as unknown[])
      : [];
    const at = times.indexOf(closing);
    const window = at < 0 ? [] : precipitation.slice(at, at + 3).map(num).filter((v): v is number => v !== null);
    return {
      point_id: point.id,
      current_mm: num(location.current?.precipitation),
      weather_code: num(location.current?.weather_code),
      hour_mm: at < 0 ? null : num(precipitation[at]),
      hour_probability_pct: at < 0 ? null : num(probability[at]),
      hour: at < 0 ? null : closing,
      peak_3h_mm: window.length > 0 ? Math.max(...window) : null,
    };
  });
}

/** A forecast rainfall alert for one sample point's area. */
export interface RainfallAlert {
  id: string;
  point_id: string;
  label: string;
  level: RainfallLevel;
  mm_per_hour: number;
  probability_pct: number | null;
  hour: string;
  affected_stop_ids: string[];
}

export function rainfallAlerts(
  readings: readonly RainfallReading[],
  points: readonly RainfallSamplePoint[],
  stops: readonly Stop[]
): RainfallAlert[] {
  const pointOf = new Map(points.map((point) => [point.id, point]));
  return readings.flatMap((reading) => {
    const point = pointOf.get(reading.point_id);
    if (!point || reading.hour_mm === null || reading.hour === null) return [];
    const level = rainfallLevel(reading.hour_mm);
    if (!level) return [];
    return [
      {
        id: `wx-${point.id}`,
        point_id: point.id,
        label: point.label,
        level,
        mm_per_hour: reading.hour_mm,
        probability_pct: reading.hour_probability_pct,
        hour: reading.hour,
        affected_stop_ids: stops.filter((stop) => haversineKm(stop, point) <= point.radius_km).map((s) => s.id),
      },
    ];
  });
}

const FORECAST_TARGETS: EffectTarget[] = [...ROAD_MODES, "walk"];

/** Forecast effects: a small slowdown factor, never a closure. */
export function forecastEffects(alerts: readonly RainfallAlert[]): ConditionEffect[] {
  return alerts.flatMap((alert) =>
    alert.affected_stop_ids.map(
      (stopId): ConditionEffect => ({
        kind: "forecast",
        source_id: alert.id,
        stop_id: stopId,
        targets: FORECAST_TARGETS,
        factor: 1 + FORECAST_ALPHA[alert.level],
      })
    )
  );
}

export const OPEN_METEO_ATTRIBUTION = {
  text: "Weather data by Open-Meteo.com",
  url: "https://open-meteo.com/",
  license: "CC BY 4.0",
} as const;

export type WeatherStatus = "ok" | "unavailable" | "disabled";

/** Rainfall forecast as served to clients. Never shown as current when unavailable. */
export interface WeatherSnapshot {
  source: "open_meteo";
  status: WeatherStatus;
  /** When the readings were fetched; on "unavailable", the last good fetch (or null). */
  fetched_at: string | null;
  readings: RainfallReading[];
  /** Only populated while status is "ok": stale forecasts never raise alerts. */
  alerts: RainfallAlert[];
  attribution: typeof OPEN_METEO_ATTRIBUTION;
}
