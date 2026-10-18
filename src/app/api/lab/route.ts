import { handle, json, requireLabAccess } from "@/server/http";
import { labOverview } from "@/server/lab";

/** Research console data: all reports, events, labels, and evaluation metrics. */
export async function GET(request: Request) {
  return handle(async () => {
    requireLabAccess(request);
    return json(await labOverview());
  });
}
