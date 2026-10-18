import { handle, json } from "@/server/http";
import { buildSnapshot } from "@/server/sensing";
import { store } from "@/server/store";

/** Hazard source connection status and active official notices. */
export async function GET() {
  return handle(async () => {
    const storage = await store.storageMode();
    const snapshot = await store.read((db) => buildSnapshot(db, new Date(), storage));
    return json(snapshot.hazards);
  });
}
