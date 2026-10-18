import type { DayType, DepartureTime } from "@/core/transit/types";

export const MINUTES_PER_DAY = 24 * 60;

/** "05:30" → 330. */
export function parseClock(clock: string): number {
  const [hours, minutes] = clock.split(":").map(Number);
  return hours * 60 + minutes;
}

/** 330 → "05:30" (wraps past midnight). */
export function toClock(minutes: number): string {
  const wrapped = ((Math.round(minutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = Math.floor(wrapped / 60);
  return `${String(hours).padStart(2, "0")}:${String(wrapped % 60).padStart(2, "0")}`;
}

/** 330 → "5:30 AM"; times on a later day get a "+1" style suffix. */
export function formatClock(minutes: number): string {
  const dayOffset = Math.floor(Math.round(minutes) / MINUTES_PER_DAY);
  const [h, m] = toClock(minutes).split(":").map(Number);
  const suffix = h < 12 ? "AM" : "PM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const label = `${hour12}:${String(m).padStart(2, "0")} ${suffix}`;
  return dayOffset > 0 ? `${label} (+${dayOffset}d)` : label;
}

export function formatDuration(totalMinutes: number): string {
  const rounded = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(rounded / 60);
  const minutes = rounded % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} h`;
  return `${hours} h ${minutes} min`;
}

/** Age phrasing for observations, e.g. "just now", "12 min ago", "3 h ago". */
export function formatAge(minutes: number): string {
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${Math.round(minutes)} min ago`;
  const hours = Math.round(minutes / 60);
  return hours < 48 ? `${hours} h ago` : `${Math.round(hours / 24)} d ago`;
}

export function dayTypeOf(dow: number): DayType {
  const normalized = ((dow % 7) + 7) % 7;
  if (normalized === 0) return "sunday";
  if (normalized === 6) return "saturday";
  return "weekday";
}

export function departureTimeOf(date: Date): DepartureTime {
  return { dow: date.getDay(), minutes: date.getHours() * 60 + date.getMinutes() };
}

/**
 * Parses a local "YYYY-MM-DDTHH:MM" value (as produced by
 * `<input type="datetime-local">`); returns null when malformed.
 */
export function parseLocalDateTime(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const [, y, mo, d, h, mi] = match.map(Number);
  const date = new Date(y, mo - 1, d, h, mi);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toLocalDateTimeValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

export function minutesBetween(fromIso: string, to: Date): number {
  return (to.getTime() - new Date(fromIso).getTime()) / 60_000;
}

/** Cebu observes Philippine Standard Time (UTC+8, no daylight saving). */
export const CEBU_TIME_ZONE = "Asia/Manila";
const CEBU_UTC_OFFSET = "+08:00";

/** Day of week and wall-clock minutes in Cebu for an instant. */
export function cebuDepartureTime(instant: Date): DepartureTime {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CEBU_TIME_ZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant);
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  const dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(value("weekday"));
  return { dow, minutes: Number(value("hour")) * 60 + Number(value("minute")) };
}

/** The instant of a Cebu wall-clock "YYYY-MM-DDTHH:MM" value. */
export function cebuInstant(localValue: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(localValue)) return null;
  const date = new Date(`${localValue}:00${CEBU_UTC_OFFSET}`);
  return Number.isNaN(date.getTime()) ? null : date;
}
