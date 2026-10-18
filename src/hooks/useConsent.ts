"use client";

import { useSyncExternalStore } from "react";
import { STORAGE_KEYS, readJson, writeJson } from "@/lib/storage";

/**
 * Opt-in choices, kept on the device. Using route guidance never requires
 * either: attaching location to reports and sharing ride traces are
 * separate, revocable decisions.
 */
export interface Consent {
  /** Attach location to reports (reduced to distance-from-stop on arrival). */
  reportLocation: "granted" | "denied" | "unset";
  /** Share stop-to-stop ride times derived from GPS during a ride. */
  rideTraces: boolean;
  updated_at: string | null;
}

const DEFAULT_CONSENT: Consent = { reportLocation: "unset", rideTraces: false, updated_at: null };
const listeners = new Set<() => void>();
let cached: Consent | null = null;

function snapshot(): Consent {
  cached ??= { ...DEFAULT_CONSENT, ...readJson<Partial<Consent>>(STORAGE_KEYS.consent, {}) };
  return cached;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEYS.consent) return;
    cached = null;
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function updateConsent(patch: Partial<Omit<Consent, "updated_at">>): void {
  cached = { ...snapshot(), ...patch, updated_at: new Date().toISOString() };
  writeJson(STORAGE_KEYS.consent, cached);
  listeners.forEach((listener) => listener());
}

export function useConsent(): Consent {
  return useSyncExternalStore(subscribe, snapshot, () => DEFAULT_CONSENT);
}
