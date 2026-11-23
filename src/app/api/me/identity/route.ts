import { auth, authEnabled } from "@/auth";
import { contributorOf, handle, json } from "@/server/http";
import { nicknameOf } from "@/server/identity";

/** How this visitor contributes: signed in with Google, signed out, or dev mode (no sign-in configured). */
export async function GET(request: Request) {
  return handle(async () => {
    if (!authEnabled) {
      const pseudonym = contributorOf(request);
      return json({ mode: "dev", signed_in: false, nickname: pseudonym ? await nicknameOf(pseudonym) : null, researcher: false });
    }
    const session = await auth();
    return json({
      mode: "google",
      signed_in: Boolean(session?.pseudonym),
      nickname: session?.nickname || null,
      researcher: session?.researcher ?? false,
    });
  });
}
