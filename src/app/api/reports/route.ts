import { requireContributor } from "@/server/access";
import { handle, json, readBody } from "@/server/http";
import { submitReport } from "@/server/reports";

/** Submit a delay, flooding, full-vehicle, or road-disruption report. */
export async function POST(request: Request) {
  return handle(async () => {
    const contributor = await requireContributor(request);
    return json(await submitReport(await readBody(request), contributor), 201);
  });
}
