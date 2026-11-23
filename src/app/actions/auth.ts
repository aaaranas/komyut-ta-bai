"use server";

import { authEnabled, signIn, signOut } from "@/auth";

/** Starts Google sign-in and returns to `redirectTo` (a same-site path). */
export async function signInWithGoogle(redirectTo: string) {
  if (!authEnabled) return;
  const target = redirectTo.startsWith("/") && !redirectTo.startsWith("//") ? redirectTo : "/";
  await signIn("google", { redirectTo: target });
}

export async function signOutOfGoogle(redirectTo = "/") {
  if (!authEnabled) return;
  await signOut({ redirectTo: redirectTo.startsWith("/") && !redirectTo.startsWith("//") ? redirectTo : "/" });
}
