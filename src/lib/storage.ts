/**
 * Per-device conveniences kept in localStorage. Every access is guarded:
 * storage can be unavailable (private mode, blocked site data).
 */
export const STORAGE_KEYS = {
  device: "komyut-device-id",
  consent: "komyut-consent",
  recentSearches: "komyut-recent-searches",
  installDismissed: "komyut-install-dismissed",
  labKey: "komyut-lab-key",
} as const;

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked — the preference just won't persist.
  }
}

export function readString(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeString(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}
