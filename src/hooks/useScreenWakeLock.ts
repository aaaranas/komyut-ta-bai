"use client";

import { useEffect, useState } from "react";

export type WakeLockState = "idle" | "held" | "refused" | "unsupported";

/**
 * Keeps the screen on while `active` (a web app only gets location while it
 * is open and visible). Re-acquires the lock when the app returns to the
 * foreground, since browsers release it when hidden, and releases it as soon
 * as `active` turns false. No background tracking is attempted.
 */
export function useScreenWakeLock(active: boolean): WakeLockState {
  const [state, setState] = useState<WakeLockState>("idle");

  useEffect(() => {
    if (!active) return;
    if (!("wakeLock" in navigator)) {
      queueMicrotask(() => setState("unsupported"));
      return () => setState("idle");
    }
    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const acquire = async () => {
      if (document.visibilityState !== "visible" || sentinel) return;
      try {
        const lock = await navigator.wakeLock.request("screen");
        if (cancelled) {
          void lock.release();
          return;
        }
        sentinel = lock;
        setState("held");
        lock.addEventListener("release", () => {
          sentinel = null;
          if (!cancelled) setState("idle");
        });
      } catch {
        if (!cancelled) setState("refused");
      }
    };

    const onVisibility = () => void acquire();
    void acquire();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      void sentinel?.release();
      sentinel = null;
      setState("idle");
    };
  }, [active]);

  return state;
}
