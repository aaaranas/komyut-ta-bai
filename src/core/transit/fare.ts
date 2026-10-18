import type { Fare } from "@/core/transit/types";

/** Statutory 20% discount for students, seniors, and PWDs (RA 11314, 9994, 10754). */
export const STATUTORY_DISCOUNT = 0.2;

/** Fare for riding `km` on one vehicle. */
export function fareForDistance(fare: Fare, km: number): number {
  if (fare.kind === "flat") return fare.amount;
  return fare.base_fare + Math.max(0, km - fare.base_km) * fare.per_km;
}

/** Discounted fare for the same ride (published amount when the operator has one). */
export function discountedFareForDistance(fare: Fare, km: number): number {
  if (fare.kind === "flat" && fare.discounted_amount !== undefined) {
    return fare.discounted_amount;
  }
  return fareForDistance(fare, km) * (1 - STATUTORY_DISCOUNT);
}

export function formatPeso(pesos: number): string {
  return `₱${Math.round(pesos).toLocaleString("en-PH")}`;
}

/** e.g. "₱50 flat", "₱13 first 4 km + ₱1.80/km", "Free ride". */
export function describeFare(fare: Fare): string {
  if (fare.kind === "flat") {
    if (fare.amount === 0) return "Free ride";
    const discount =
      fare.discounted_amount !== undefined
        ? ` · ${formatPeso(fare.discounted_amount)} discounted`
        : "";
    return `${formatPeso(fare.amount)} flat${discount}`;
  }
  const base =
    fare.base_km > 0
      ? `${formatPeso(fare.base_fare)} first ${fare.base_km} km`
      : formatPeso(fare.base_fare);
  return `${base} + ₱${fare.per_km.toFixed(2)}/km`;
}
