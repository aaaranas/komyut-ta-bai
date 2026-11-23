import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  FORECAST_ALPHA,
  closingHourOf,
  forecastEffects,
  parseOpenMeteo,
  rainfallAlerts,
  rainfallLevel,
  type RainfallSamplePoint,
} from "@/core/hazards/rainfall";
import { compileConditions, edgeCost } from "@/core/planner/conditions";
import type { RideEdge, WalkEdge } from "@/core/planner/graph";
import type { Stop } from "@/core/transit/types";

const POINT: RainfallSamplePoint = { id: "p", label: "Test area", lat: 10.3, lng: 123.9, radius_km: 2 };
const STOPS: Stop[] = [
  { id: "near", name: "Near", lat: 10.301, lng: 123.9, municipality: "Cebu City", type: "street_stop" },
  { id: "near2", name: "Near 2", lat: 10.302, lng: 123.901, municipality: "Cebu City", type: "street_stop" },
  { id: "far", name: "Far", lat: 10.5, lng: 124.1, municipality: "Danao City", type: "street_stop" },
];
// 14:20 in Manila (UTC+8): the hour in progress closes at 15:00 local.
const NOW = new Date("2026-11-23T06:20:00Z");

function body(hourMm: number) {
  return {
    current: { precipitation: 1.2, rain: 1.2, weather_code: 63 },
    hourly: {
      time: ["2026-11-23T14:00", "2026-11-23T15:00", "2026-11-23T16:00", "2026-11-23T17:00"],
      precipitation: [0.4, hourMm, 2, 40],
      precipitation_probability: [50, 80, 60, 90],
    },
  };
}

describe("PAGASA rainfall levels", () => {
  it("classifies at the warning thresholds", () => {
    assert.equal(rainfallLevel(0), null);
    assert.equal(rainfallLevel(7.4), null);
    assert.equal(rainfallLevel(7.5), "yellow");
    assert.equal(rainfallLevel(14.9), "yellow");
    assert.equal(rainfallLevel(15), "orange");
    assert.equal(rainfallLevel(29.9), "orange");
    assert.equal(rainfallLevel(30), "red");
    assert.equal(rainfallLevel(Number.NaN), null);
  });
});

describe("Open-Meteo parsing", () => {
  it("reads the hour now in progress (preceding-hour sums) in Manila time", () => {
    assert.equal(closingHourOf(NOW), "2026-11-23T15:00");
    const [reading] = parseOpenMeteo(body(9), [POINT], NOW);
    assert.equal(reading.hour_mm, 9);
    assert.equal(reading.hour_probability_pct, 80);
    assert.equal(reading.peak_3h_mm, 40);
  });

  it("rejects a malformed reply instead of reading zero rainfall", () => {
    assert.throws(() => parseOpenMeteo({ error: true }, [POINT], NOW));
    assert.throws(() => parseOpenMeteo([body(1), body(1)], [POINT], NOW));
  });

  it("raises an alert only at or above 7.5 mm, for stops inside the radius", () => {
    assert.deepEqual(rainfallAlerts(parseOpenMeteo(body(7.4), [POINT], NOW), [POINT], STOPS), []);
    const [alert] = rainfallAlerts(parseOpenMeteo(body(7.5), [POINT], NOW), [POINT], STOPS);
    assert.equal(alert.level, "yellow");
    assert.deepEqual(alert.affected_stop_ids, ["near", "near2"]);
  });
});

describe("forecast effects", () => {
  const ride: RideEdge = { kind: "ride", from: "near", to: "near2", route_id: "r", mode: "jeepney", minutes: 10, km: 1, offset_mins: 0 };
  const walk: WalkEdge = { kind: "walk", from: "near", to: "far", minutes: 8, source: "proximity" };

  it("only multiplies cost by 1 + α and never closes an edge", () => {
    for (const mm of [7.5, 15, 30, 500]) {
      const alerts = rainfallAlerts(parseOpenMeteo(body(mm), [POINT], NOW), [POINT], STOPS);
      const compiled = compileConditions(forecastEffects(alerts));
      const level = alerts[0].level;
      const rideCost = edgeCost(ride, compiled);
      const walkCost = edgeCost(walk, compiled);
      assert.ok(rideCost && walkCost, "a forecast must never make an edge unusable");
      // Both ends in one forecast area: applied once, not squared.
      assert.equal(rideCost.minutes, 10 * (1 + FORECAST_ALPHA[level]));
      assert.ok(Number.isFinite(rideCost.minutes) && rideCost.minutes >= 10);
      assert.equal(walkCost.minutes, 8 * (1 + FORECAST_ALPHA[level]));
    }
    assert.equal(compileConditions(forecastEffects([])).closures.size, 0);
  });
});
