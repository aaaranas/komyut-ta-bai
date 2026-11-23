"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { signInWithGoogle, signOutOfGoogle } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { api, type Identity } from "@/lib/api";
import { cn } from "@/lib/utils";

/** How this visitor contributes; null while loading or when the server can't be reached. */
export function useIdentity(): { identity: Identity | null; reload: () => Promise<void> } {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const reload = useCallback(async () => {
    try {
      setIdentity(await api.identity());
    } catch {
      setIdentity(null);
    }
  }, []);
  useEffect(() => {
    // Identity depends on browser cookies and the device id.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload();
  }, [reload]);
  return { identity, reload };
}

export function DevModeChip({ className }: { className?: string }) {
  return (
    <p className={cn("rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground", className)}>
      <span className="font-semibold text-foreground">Dev mode.</span> Google sign-in isn&apos;t configured on this
      server, so contributions use this device&apos;s pseudonym.
    </p>
  );
}

export function SignInButton({ label = "Sign in with Google", className }: { label?: string; className?: string }) {
  const pathname = usePathname();
  return (
    <form action={signInWithGoogle.bind(null, pathname || "/")}>
      <Button type="submit" className={className}>
        {label}
      </Button>
    </form>
  );
}

export function SignOutButton({ redirectTo }: { redirectTo?: string }) {
  const pathname = usePathname();
  return (
    <form action={signOutOfGoogle.bind(null, redirectTo ?? pathname ?? "/")}>
      <Button type="submit" variant="outline" size="sm">
        Sign out
      </Button>
    </form>
  );
}

/**
 * Planning stays open; contributing needs Google sign-in when it is
 * configured. Other people only ever see the random nickname.
 */
export function ContributionGate({ children }: { children: React.ReactNode }) {
  const { identity } = useIdentity();
  if (!identity) return <>{children}</>;
  if (identity.mode === "dev") {
    return (
      <>
        <DevModeChip className="mt-4" />
        {children}
      </>
    );
  }
  if (!identity.signed_in) {
    return (
      <div className="mt-6 rounded-xl border p-5">
        <p className="text-[15px] font-semibold">Sign in to report</p>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          Reports and confirmations need a Google sign-in so one person counts once. Others see only a random
          nickname, never your name or email. Trip planning works without signing in.
        </p>
        <SignInButton className="mt-4" />
      </div>
    );
  }
  return (
    <>
      <p className="mt-4 text-xs text-muted-foreground">
        Reporting as <span className="font-semibold text-foreground">{identity.nickname}</span>.
      </p>
      {children}
    </>
  );
}
