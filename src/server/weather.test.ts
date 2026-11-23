import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { RainfallSamplePoint } from "@/core/hazards/rainfall";
import type { Stop } from "@/core/transit/types";
import { createWeatherService, openMeteoUrl } from "@/server/weather";

const POINT: RainfallSamplePoint = { id: "p", label: "Test area", lat: 10.3, lng: 123.9, radius_km: 2 };
const STOPS: Stop[] = [{ id: "near", name: "Near", lat: 10.301, lng: 123.9, municipality: "Cebu City", type: "street_stop" }];
const NOW = new Date("2026-11-23T06:20:00Z");

function body(hourMm: number) {
  return {
    current: { precipitation: 1.2, rain: 1.2, weather_code: 63 },
    hourly: {
      time: ["2026-11-23T14:00", "2026-11-23T15:00", "2026-11-23T16:00"],
      precipitation: [0.4, hourMm, 2],
      precipitation_probability: [50, 80, 60],
    },
  };
}

it("requests every sample point in one call with the agreed parameters", () => {
  const url = new URL(openMeteoUrl([POINT, { ...POINT, id: "q", lat: 10.4, lng: 124 }]));
  assert.equal(url.origin + url.pathname, "https://api.open-meteo.com/v1/forecast");
  assert.equal(url.searchParams.get("latitude"), "10.3000,10.4000");
  assert.equal(url.searchParams.get("current"), "precipitation,rain,weather_code");
  assert.equal(url.searchParams.get("hourly"), "precipitation,precipitation_probability");
  assert.equal(url.searchParams.get("timezone"), "Asia/Manila");
  assert.equal(url.searchParams.get("forecast_days"), "1");
});

describe("weather service", () => {
  const okFetch = (mm: number) => (async () => new Response(JSON.stringify(body(mm)))) as unknown as typeof fetch;

  it("caches for 15 minutes", async () => {
    let calls = 0;
    let t = NOW.getTime();
    const service = createWeatherService({
      fetch: (async (...args: Parameters<typeof fetch>) => {
        calls += 1;
        return okFetch(20)(...args);
      }) as typeof fetch,
      now: () => new Date(t),
      points: [POINT],
    });
    const first = await service(STOPS);
    assert.equal(first.status, "ok");
    assert.equal(first.alerts[0].level, "orange");
    t += 14 * 60_000;
    await service(STOPS);
    assert.equal(calls, 1);
    t += 2 * 60_000;
    await service(STOPS);
    assert.equal(calls, 2);
  });

  it("a failed fetch is 'unavailable' with no readings, not zero rainfall", async () => {
    const service = createWeatherService({
      fetch: (async () => {
        throw new Error("network down");
      }) as typeof fetch,
      now: () => NOW,
      points: [POINT],
    });
    const result = await service(STOPS);
    assert.equal(result.status, "unavailable");
    assert.equal(result.fetched_at, null);
    assert.deepEqual(result.readings, []);
    assert.deepEqual(result.alerts, []);
  });

  it("keeps the last good value with its timestamp, but never as current", async () => {
    let t = NOW.getTime();
    let fail = false;
    const service = createWeatherService({
      fetch: (async (...args: Parameters<typeof fetch>) => {
        if (fail) return new Response("oops", { status: 503 });
        return okFetch(35)(...args);
      }) as typeof fetch,
      now: () => new Date(t),
      points: [POINT],
    });
    await service(STOPS);
    fail = true;
    t += 20 * 60_000;
    const stale = await service(STOPS);
    assert.equal(stale.status, "unavailable");
    assert.equal(stale.fetched_at, NOW.toISOString());
    assert.equal(stale.readings[0].hour_mm, 35);
    assert.deepEqual(stale.alerts, [], "a stale forecast raises no alert");
  });
});
