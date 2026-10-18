import { handle, json, readBody, requireContributor } from "@/server/http";
import { submitReport } from "@/server/reports";

/** Submit a delay, flooding, full-vehicle, or road-disruption report. */
export async function POST(request: Request) {
  return handle(async () => {
    const contributor = requireContributor(request);
    return json(await submitReport(await readBody(request), contributor), 201);
  });
}
