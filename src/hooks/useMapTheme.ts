"use client";

import { useTheme } from "next-themes";
import type { MapTheme } from "@/lib/basemaps";

/** The basemap variant matching the app's resolved light/dark theme. */
export function useMapTheme(): MapTheme {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === "dark" ? "dark" : "light";
}
