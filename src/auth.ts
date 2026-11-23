import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { isResearcher, linkGoogleAccount } from "@/server/identity";

/**
 * Google sign-in is on only when its credentials and a session secret are
 * set. Without them the app runs in "dev mode": contributions use the
 * per-device pseudonym and the UI says so.
 */
export const authEnabled = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET && process.env.AUTH_SECRET
);

declare module "next-auth" {
  interface Session {
    pseudonym: string;
    nickname: string;
    researcher: boolean;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    pseudonym?: string;
    nickname?: string;
    email_hash?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt" },
  trustHost: true,
  callbacks: {
    /**
     * On sign-in, links the Google account to its pseudonym and keeps only
     * the pseudonym, nickname, and an email hash in the (encrypted) token —
     * never the name, email, or picture.
     */
    async jwt({ token, account, profile }) {
      if (account?.provider === "google" && account.providerAccountId) {
        const email = typeof profile?.email === "string" ? profile.email : "";
        const linked = await linkGoogleAccount(account.providerAccountId, email);
        return { pseudonym: linked.pseudonym, nickname: linked.nickname, email_hash: linked.email_hash, exp: token.exp, iat: token.iat, jti: token.jti };
      }
      return token;
    },
    async session({ session, token }) {
      return {
        expires: session.expires,
        user: { name: token.nickname ?? null, email: null, image: null },
        pseudonym: token.pseudonym ?? "",
        nickname: token.nickname ?? "",
        researcher: isResearcher(token.email_hash),
      } as typeof session;
    },
  },
});
