import { requireContributor } from "@/server/access";
import { handle, json } from "@/server/http";
import { contributorSummary, eraseContributor } from "@/server/reports";

/** Your pseudonymous contributions and reputation. */
export async function GET(request: Request) {
  return handle(async () => json(await contributorSummary(await requireContributor(request))));
}

/** Erase everything tied to your pseudonym. */
export async function DELETE(request: Request) {
  return handle(async () => json(await eraseContributor(await requireContributor(request))));
}
