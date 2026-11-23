import { requireLabAccess } from "@/server/access";
import { handle, json, readBody } from "@/server/http";
import { setLabel } from "@/server/lab";

/** Attach an independently justified ground-truth label to a report. */
export async function POST(request: Request) {
  return handle(async () => {
    await requireLabAccess(request);
    return json(await setLabel(await readBody(request)));
  });
}
