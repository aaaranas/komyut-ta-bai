import { handle, json, requireLabAccess } from "@/server/http";
import { clearReplays, loadDemoData } from "@/server/lab";

/** Load all scenarios at once — one-click demo reset for the defense. */
export async function POST(request: Request) {
  return handle(async () => {
    requireLabAccess(request);
    return json(await loadDemoData(), 201);
  });
}

/** Remove all demo data. */
export async function DELETE(request: Request) {
  return handle(async () => {
    requireLabAccess(request);
    return json(await clearReplays());
  });
}
