"use client";

import { useCallback, useEffect, useState } from "react";
import { STORAGE_KEYS, readJson, writeJson } from "@/lib/storage";

const MAX_ENTRIES = 5;

export interface RecentSearch {
  fromId: string;
  toId: string;
  fromName: string;
  toName: string;
}

export function useRecentSearches() {
  const [searches, setSearches] = useState<RecentSearch[]>([]);

  useEffect(() => {
    const stored = readJson<unknown>(STORAGE_KEYS.recentSearches, []);
    // Reading device storage after hydration keeps server and client markup identical.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearches(Array.isArray(stored) ? (stored as RecentSearch[]) : []);
  }, []);

  const addSearch = useCallback((entry: RecentSearch) => {
    setSearches((previous) => {
      const next = [
        entry,
        ...previous.filter((s) => !(s.fromId === entry.fromId && s.toId === entry.toId)),
      ].slice(0, MAX_ENTRIES);
      writeJson(STORAGE_KEYS.recentSearches, next);
      return next;
    });
  }, []);

  const clearSearches = useCallback(() => {
    writeJson(STORAGE_KEYS.recentSearches, []);
    setSearches([]);
  }, []);

  return { searches, addSearch, clearSearches };
}
