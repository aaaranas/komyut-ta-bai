import { auth, authEnabled } from "@/auth";
import { HttpError, deviceContributor, requireLabKey } from "@/server/http";
import { isResearcher } from "@/server/identity";

export type IdentityMode = "google" | "dev";

export const identityMode = (): IdentityMode => (authEnabled ? "google" : "dev");

/**
 * The pseudonym behind a contribution. With Google sign-in configured,
 * reporting, confirming, clearing, withdrawing, and erasing need a signed-in
 * session; in dev mode the per-device pseudonym is used instead.
 */
export async function requireContributor(request: Request): Promise<string> {
  if (!authEnabled) return deviceContributor(request);
  const session = await auth();
  if (!session?.pseudonym) throw new HttpError(401, "Sign in with Google to report or confirm.");
  return session.pseudonym;
}

/**
 * Research console gate: a signed-in researcher on the KOMYUT_RESEARCHER_EMAILS
 * allowlist; when sign-in is off, the shared KOMYUT_LAB_KEY (if set).
 */
export async function requireLabAccess(request: Request): Promise<void> {
  if (!authEnabled) return requireLabKey(request);
  const session = await auth();
  if (!session) throw new HttpError(401, "Sign in as a researcher to use the lab.");
  if (!session.researcher) throw new HttpError(403, "This account is not on the researcher list.");
}

export { isResearcher };
