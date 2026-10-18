import { handle, HttpError, json, readBody, requireLabAccess } from "@/server/http";
import { clearReplays, loadScenario } from "@/server/lab";

/** Load a controlled replay scenario. */
export async function POST(request: Request) {
  return handle(async () => {
    requireLabAccess(request);
    const body = await readBody(request);
    if (typeof body.scenario_id !== "string") throw new HttpError(400, "scenario_id is required.");
    return json(await loadScenario(body.scenario_id), 201);
  });
}

/** Remove all replay data. */
export async function DELETE(request: Request) {
  return handle(async () => {
    requireLabAccess(request);
    return json(await clearReplays());
  });
}
