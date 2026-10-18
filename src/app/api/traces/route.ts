import { handle, json, readBody, requireContributor } from "@/server/http";
import { submitTrace } from "@/server/traces";

/** Stop-to-stop travel times derived on-device from a consented ride trace. */
export async function POST(request: Request) {
  return handle(async () => {
    const contributor = requireContributor(request);
    return json(await submitTrace(await readBody(request), contributor), 201);
  });
}
