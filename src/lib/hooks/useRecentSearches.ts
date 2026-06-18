"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "komyut-recent-searches";
const MAX_ENTRIES = 5;

export interface RecentSearch {
  fromId: string;
  toId: string;
  fromName: string;
  toName: string;
}

function readFromStorage(): RecentSearch[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function useRecentSearches() {
  const [searches, setSearches] = useState<RecentSearch[]>([]);

  useEffect(() => {
    setSearches(readFromStorage());
  }, []);

  const addSearch = useCallback((entry: RecentSearch) => {
    setSearches((prev) => {
      const deduped = prev.filter(
        (s) => !(s.fromId === entry.fromId && s.toId === entry.toId)
      );
      const next = [entry, ...deduped].slice(0, MAX_ENTRIES);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // storage quota exceeded — skip persisting
      }
      return next;
    });
  }, []);

  const clearSearches = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setSearches([]);
  }, []);

  return { searches, addSearch, clearSearches };
}
