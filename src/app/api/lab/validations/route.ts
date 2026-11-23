import { requireLabAccess } from "@/server/access";
import { handle, json, readBody } from "@/server/http";
import { addValidation } from "@/server/lab";

/** Record a field validation ride against baseline and enriched estimates. */
export async function POST(request: Request) {
  return handle(async () => {
    await requireLabAccess(request);
    return json(await addValidation(await readBody(request)), 201);
  });
}
