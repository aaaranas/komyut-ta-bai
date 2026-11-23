import type { NextRequest } from "next/server";
import { stops } from "@/core/transit/catalog";
import { handle, HttpError, json } from "@/server/http";
import { buildSnapshot, markRouteResponses } from "@/server/sensing";
import { store } from "@/server/store";
import { currentWeather } from "@/server/weather";

/**
 * Published events, graph effects, travel times, hazard status, and the
 * rainfall forecast. `?at=` evaluates another instant (without the forecast,
 * which only describes now).
 */
export async function GET(request: NextRequest) {
  return handle(async () => {
    const at = request.nextUrl.searchParams.get("at");
    const now = at ? new Date(at) : new Date();
    if (Number.isNaN(now.getTime())) throw new HttpError(400, "Invalid `at` timestamp.");
    const [storage, weather] = await Promise.all([store.storageMode(), at ? null : currentWeather(stops)]);
    const snapshot = await store.read((db) => buildSnapshot(db, now, storage, weather));
    // Only live responses count as route responses; `?at=` is for the lab.
    if (!at) await markRouteResponses(snapshot);
    return json(snapshot);
  });
}
