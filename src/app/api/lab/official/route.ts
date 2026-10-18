import { handle, json, readBody, requireLabAccess } from "@/server/http";
import { addOfficial } from "@/server/lab";

/** Enter an official record by hand (shown as "manual", never as a live feed). */
export async function POST(request: Request) {
  return handle(async () => {
    requireLabAccess(request);
    return json(await addOfficial(await readBody(request)), 201);
  });
}
