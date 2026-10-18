import { dayTypeOf, MINUTES_PER_DAY, parseClock } from "@/core/transit/time";
import type { Route } from "@/core/transit/types";

/** How far ahead the planner looks for the next service (overnight waits). */
const LOOKAHEAD_DAYS = 2;

export interface Boarding {
  /** Minutes spent waiting at the stop. */
  wait: number;
  /** Absolute boarding time (minutes from the departure day's midnight). */
  departs: number;
  /** True when the wait is an expected value derived from the headway. */
  estimated: boolean;
}

/**
 * Next feasible boarding of `route` at a stop `offsetMins` of in-vehicle
 * time from the route's origin, for a rider arriving at absolute time `at`
 * on a trip that started on day-of-week `departDow`.
 *
 * Frequency services wait half a headway inside a service window (the
 * expected wait for random arrivals) or until the window opens; scheduled
 * services wait for the next timetabled departure. Returns null when no
 * service runs within the lookahead.
 */
export function nextBoarding(
  route: Route,
  offsetMins: number,
  at: number,
  departDow: number
): Boarding | null {
  for (let day = 0; day < LOOKAHEAD_DAYS + 1; day++) {
    const dayType = dayTypeOf(departDow + day);
    const base = day * MINUTES_PER_DAY + offsetMins;

    if (route.service.kind === "scheduled") {
      const times = route.service.departures
        .filter((set) => set.days.includes(dayType))
        .flatMap((set) => set.times.map(parseClock))
        .map((time) => base + time)
        .filter((time) => time >= at)
        .sort((a, b) => a - b);
      if (times.length > 0) {
        return { wait: times[0] - at, departs: times[0], estimated: false };
      }
      continue;
    }

    const windows = route.service.windows
      .filter((window) => window.days.includes(dayType))
      .map((window) => {
        const start = base + parseClock(window.start);
        let end = base + parseClock(window.end);
        if (end < start) end += MINUTES_PER_DAY; // runs past midnight
        return { start, end, headway: window.headway_mins };
      })
      .sort((a, b) => a.start - b.start);

    for (const window of windows) {
      if (at > window.end) continue;
      if (at >= window.start) {
        const wait = Math.min(window.headway / 2, window.end - at);
        return { wait, departs: at + wait, estimated: true };
      }
      return { wait: window.start - at, departs: window.start, estimated: false };
    }
  }
  return null;
}

/** Typical headway at a given absolute time, used to size full-vehicle waits. */
export function headwayAt(route: Route, at: number, departDow: number): number {
  if (route.service.kind === "scheduled") return 60;
  const dayType = dayTypeOf(departDow + Math.floor(at / MINUTES_PER_DAY));
  const window =
    route.service.windows.find((candidate) => candidate.days.includes(dayType)) ??
    route.service.windows[0];
  return window?.headway_mins ?? 30;
}

/** Summary of service hours for display, e.g. "05:00–21:00". */
export function serviceHours(route: Route): string {
  if (route.service.kind === "scheduled") {
    const times = route.service.departures.flatMap((set) => set.times).sort();
    return times.length > 0 ? `${times[0]}–${times[times.length - 1]}` : "—";
  }
  const starts = route.service.windows.map((window) => window.start).sort();
  const ends = route.service.windows.map((window) => window.end).sort();
  return `${starts[0]}–${ends[ends.length - 1]}`;
}

/** Headway summary for display, e.g. "every 10 min". */
export function headwaySummary(route: Route): string {
  if (route.service.kind === "scheduled") {
    const count = route.service.departures[0]?.times.length ?? 0;
    return `${count} scheduled trips`;
  }
  const labels = [...new Set(route.service.windows.map((w) => w.headway_label))];
  return labels.join(" / ");
}
