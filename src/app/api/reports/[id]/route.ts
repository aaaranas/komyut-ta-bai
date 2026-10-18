import { handle, json, requireContributor } from "@/server/http";
import { withdrawReport } from "@/server/reports";

/** Withdraw one of your own reports; it stops counting immediately. */
export async function DELETE(request: Request, ctx: RouteContext<"/api/reports/[id]">) {
  return handle(async () => {
    const { id } = await ctx.params;
    return json(await withdrawReport(id, requireContributor(request)));
  });
}
