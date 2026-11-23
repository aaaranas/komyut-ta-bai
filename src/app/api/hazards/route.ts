import { stops } from "@/core/transit/catalog";
import { handle, json } from "@/server/http";
import { buildSnapshot } from "@/server/sensing";
import { store } from "@/server/store";
import { currentWeather } from "@/server/weather";

/** Hazard source connection status, active official notices, and the rainfall forecast. */
export async function GET() {
  return handle(async () => {
    const [storage, weather] = await Promise.all([store.storageMode(), currentWeather(stops)]);
    const snapshot = await store.read((db) => buildSnapshot(db, new Date(), storage, weather));
    return json({ ...snapshot.hazards, weather: snapshot.weather });
  });
}
