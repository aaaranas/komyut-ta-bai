import {
  OPEN_METEO_ATTRIBUTION,
  RAINFALL_SAMPLE_POINTS,
  parseOpenMeteo,
  rainfallAlerts,
  type RainfallReading,
  type RainfallSamplePoint,
  type WeatherSnapshot,
} from "@/core/hazards/rainfall";
import type { Stop } from "@/core/transit/types";

export const OPEN_METEO_ENDPOINT = "https://api.open-meteo.com/v1/forecast";
/** One multi-point call per 15 minutes is ~96 calls a day, far under the 10,000/day free limit. */
export const WEATHER_CACHE_MS = 15 * 60_000;
export const WEATHER_TIMEOUT_MS = 10_000;
/** After a failure, wait this long before trying again, so outages don't multiply calls. */
export const WEATHER_RETRY_MS = 2 * 60_000;

export function openMeteoUrl(points: readonly RainfallSamplePoint[]): string {
  const params = new URLSearchParams({
    latitude: points.map((p) => p.lat.toFixed(4)).join(","),
    longitude: points.map((p) => p.lng.toFixed(4)).join(","),
    current: "precipitation,rain,weather_code",
    hourly: "precipitation,precipitation_probability",
    timezone: "Asia/Manila",
    forecast_days: "1",
  });
  return `${OPEN_METEO_ENDPOINT}?${params}`;
}

interface Options {
  fetch?: typeof fetch;
  now?: () => Date;
  points?: readonly RainfallSamplePoint[];
}

/**
 * Open-Meteo rainfall with a 15-minute server cache. On failure it returns the
 * last good readings with their fetch time and status "unavailable" (no
 * alerts), so a stale forecast is never presented as current and a failed
 * call is never read as zero rainfall.
 */
export function createWeatherService({ fetch: doFetch = fetch, now = () => new Date(), points = RAINFALL_SAMPLE_POINTS }: Options = {}) {
  let good: { at: number; readings: RainfallReading[] } | null = null;
  let lastFailure = 0;
  let inflight: Promise<void> | null = null;

  async function refresh(): Promise<void> {
    const started = now();
    try {
      const response = await doFetch(openMeteoUrl(points), {
        signal: AbortSignal.timeout(WEATHER_TIMEOUT_MS),
        headers: { accept: "application/json" },
      });
      if (!response.ok) throw new Error(`Open-Meteo responded ${response.status}`);
      good = { at: started.getTime(), readings: parseOpenMeteo(await response.json(), points, started) };
    } catch (error) {
      lastFailure = started.getTime();
      console.warn("Open-Meteo unavailable:", error instanceof Error ? error.message : error);
    }
  }

  return async function weather(stops: readonly Stop[]): Promise<WeatherSnapshot> {
    const t = now().getTime();
    const fresh = good !== null && t - good.at < WEATHER_CACHE_MS;
    const backingOff = t - lastFailure < WEATHER_RETRY_MS;
    if (!fresh && !backingOff) {
      inflight ??= refresh().finally(() => (inflight = null));
      await inflight;
    }
    const current = good !== null && now().getTime() - good.at < WEATHER_CACHE_MS;
    return {
      source: "open_meteo",
      status: current ? "ok" : "unavailable",
      fetched_at: good ? new Date(good.at).toISOString() : null,
      readings: good?.readings ?? [],
      alerts: current ? rainfallAlerts(good!.readings, points, stops) : [],
      attribution: OPEN_METEO_ATTRIBUTION,
    };
  };
}

const DISABLED: WeatherSnapshot = {
  source: "open_meteo",
  status: "disabled",
  fetched_at: null,
  readings: [],
  alerts: [],
  attribution: OPEN_METEO_ATTRIBUTION,
};

const holder = globalThis as typeof globalThis & { __komyutWeather?: ReturnType<typeof createWeatherService> };

/** Process-wide rainfall forecast. Set KOMYUT_WEATHER=off to disable (offline development, tests). */
export async function currentWeather(stops: readonly Stop[]): Promise<WeatherSnapshot> {
  if (process.env.KOMYUT_WEATHER === "off") return DISABLED;
  holder.__komyutWeather ??= createWeatherService();
  return holder.__komyutWeather(stops);
}
