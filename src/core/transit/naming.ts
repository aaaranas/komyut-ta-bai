import type { Mode, Route } from "@/core/transit/types";

/** Plate text for routes without a code of their own. */
export const MODE_SHORT: Record<Mode, string> = {
  jeepney: "PUJ",
  mjeepney: "e-PUJ",
  mybus: "MyBus",
  bus: "Bus",
  vhire: "V-hire",
  ferry: "Ferry",
};

/** The code a commuter would look for on the vehicle, e.g. "01K", "R1", "Ceres". */
export function routeCode(route: Route): string {
  const jeepney = /^Jeepney (\w+)/.exec(route.name);
  if (jeepney && /\d/.test(jeepney[1])) return jeepney[1].toUpperCase();
  const mybus = /^MyBus Route (\d+)/.exec(route.name);
  if (mybus) return `R${mybus[1]}`;
  if (route.name.startsWith("e-Jeepney")) return "e-Jeep";
  if (route.name.startsWith("Beep")) return "Beep";
  if (route.operator.startsWith("Ceres")) return "Ceres";
  return MODE_SHORT[route.mode];
}

/** The route's name without the code already shown on its plate. */
export function routeTitle(route: Route): string {
  return route.name
    .replace(/^Jeepney \w+\s*(·\s*)?/, "")
    .replace(/^MyBus Route \d+\s*·\s*/, "")
    .replace(/^e-Jeepney\s*·\s*/, "")
    .replace(/^(Ceres Bus|V-hire|Beep)\s+/, "")
    .replace(/\s+Ferry$/, "")
    .trim();
}
