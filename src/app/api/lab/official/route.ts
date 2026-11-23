import { requireLabAccess } from "@/server/access";
import { handle, json, readBody } from "@/server/http";
import { addOfficial } from "@/server/lab";

/** Enter an official record by hand (shown as "manual", never as a live feed). */
export async function POST(request: Request) {
  return handle(async () => {
    await requireLabAccess(request);
    return json(await addOfficial(await readBody(request)), 201);
  });
}
