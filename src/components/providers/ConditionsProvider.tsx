"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { compileConditions, type CompiledConditions } from "@/core/planner";
import type { ConditionsSnapshot, PublicEvent } from "@/core/snapshot";
import { api } from "@/lib/api";

const POLL_MS = 60_000;
/** A snapshot older than this (e.g. served from the offline cache) is stale. */
const STALE_AFTER_MS = 3 * 60_000;

export type ConditionsStatus = "loading" | "live" | "stale" | "unavailable";

interface ConditionsValue {
  snapshot: ConditionsSnapshot | null;
  status: ConditionsStatus;
  compiled: CompiledConditions | null;
  eventsById: ReadonlyMap<string, PublicEvent>;
  refresh: () => Promise<void>;
}

const ConditionsContext = createContext<ConditionsValue | null>(null);

/**
 * Fetches the live conditions snapshot on load, every minute while the tab
 * is visible, and when the device comes back online. The planner keeps
 * working on the baseline dataset whenever the snapshot is unavailable.
 */
export function ConditionsProvider({ children }: { children: React.ReactNode }) {
  const [snapshot, setSnapshot] = useState<ConditionsSnapshot | null>(null);
  const [failed, setFailed] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const refresh = useCallback(async () => {
    try {
      setSnapshot(await api.conditions());
      setFailed(false);
    } catch {
      setFailed(true);
    }
    setNow(Date.now());
  }, []);

  useEffect(() => {
    // Initial fetch; later updates arrive through the interval and events.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
    const tick = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    const id = setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", tick);
    window.addEventListener("online", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
      window.removeEventListener("online", tick);
    };
  }, [refresh]);

  // Recompile only when the graph effects change, so plans stay stable
  // across polls that bring no new conditions.
  const effectsKey = snapshot ? JSON.stringify(snapshot.effects) : null;
  const compiled = useMemo(
    () => (effectsKey === null ? null : compileConditions(JSON.parse(effectsKey))),
    [effectsKey]
  );

  const value = useMemo<ConditionsValue>(() => {
    let status: ConditionsStatus = "loading";
    if (snapshot) {
      const age = now - new Date(snapshot.generated_at).getTime();
      status = failed || age > STALE_AFTER_MS ? "stale" : "live";
    } else if (failed) {
      status = "unavailable";
    }
    return {
      snapshot,
      status,
      compiled,
      eventsById: new Map((snapshot?.events ?? []).map((event) => [event.id, event])),
      refresh,
    };
  }, [snapshot, failed, now, compiled, refresh]);

  return <ConditionsContext.Provider value={value}>{children}</ConditionsContext.Provider>;
}

export function useConditions(): ConditionsValue {
  const value = useContext(ConditionsContext);
  if (!value) throw new Error("useConditions must be used inside ConditionsProvider");
  return value;
}
