import { handle, json, readBody, requireLabAccess } from "@/server/http";
import { addValidation } from "@/server/lab";

/** Record a field validation ride against baseline and enriched estimates. */
export async function POST(request: Request) {
  return handle(async () => {
    requireLabAccess(request);
    return json(await addValidation(await readBody(request)), 201);
  });
}
