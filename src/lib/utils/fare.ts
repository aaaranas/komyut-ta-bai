import type { Route } from "@/lib/types";

export function formatFare(pesos: number): string {
  return `₱${pesos.toLocaleString("en-PH")}`;
}

/** Human-readable fare structure, e.g. "₱150 flat" or "₱15 + ₱1.75/km". */
export function describeFare(route: Route): string {
  if ("flat" in route.fare) return `${formatFare(route.fare.base_fare)} flat`;
  return `${formatFare(route.fare.base_fare)} + ₱${route.fare.per_km.toFixed(2)}/km`;
}

/**
 * Fare charged once when boarding a route (the flat fare, or the base fare
 * of a per-km route). Per-km routes additionally accrue distance fares.
 */
export function boardingFare(route: Route): number {
  return route.fare.base_fare;
}
