import type { NextRequest } from "next/server";
import { requireLabAccess } from "@/server/access";
import { handle, HttpError } from "@/server/http";
import { EXPORT_KINDS, exportCsv, type ExportKind } from "@/server/lab";

/** CSV export: ?kind=rides | decisions | propagation. */
export async function GET(request: NextRequest) {
  return handle(async () => {
    await requireLabAccess(request);
    const kind = request.nextUrl.searchParams.get("kind") as ExportKind | null;
    if (!kind || !EXPORT_KINDS.includes(kind)) throw new HttpError(400, "kind must be rides, decisions, or propagation.");
    const date = new Date().toISOString().slice(0, 10);
    return new Response(await exportCsv(kind), {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="komyut-${kind}-${date}.csv"`,
        "cache-control": "no-store",
      },
    });
  });
}
