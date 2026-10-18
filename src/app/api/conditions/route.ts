import type { NextRequest } from "next/server";
import { handle, HttpError, json } from "@/server/http";
import { buildSnapshot } from "@/server/sensing";
import { store } from "@/server/store";

/** Published events, graph effects, travel times, and hazard status. `?at=` evaluates another instant. */
export async function GET(request: NextRequest) {
  return handle(async () => {
    const at = request.nextUrl.searchParams.get("at");
    const now = at ? new Date(at) : new Date();
    if (Number.isNaN(now.getTime())) throw new HttpError(400, "Invalid `at` timestamp.");
    const storage = await store.storageMode();
    return json(await store.read((db) => buildSnapshot(db, now, storage)));
  });
}
