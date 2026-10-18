import { handle, json, readBody, requireLabAccess } from "@/server/http";
import { setLabel } from "@/server/lab";

/** Attach an independently justified ground-truth label to a report. */
export async function POST(request: Request) {
  return handle(async () => {
    requireLabAccess(request);
    return json(await setLabel(await readBody(request)));
  });
}
