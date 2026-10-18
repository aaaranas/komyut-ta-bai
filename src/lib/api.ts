import type { ConditionsSnapshot } from "@/core/snapshot";
import type { DerivedSegment, TraceQuality } from "@/core/sensing/traces";
import type { EventStatus, Report, ReportCategory, ReportDetails, ReportKind, Reputation } from "@/core/sensing/types";
import { STORAGE_KEYS, readString, writeString } from "@/lib/storage";

const DEVICE_HEADER = "x-komyut-device";
const LAB_KEY_HEADER = "x-komyut-lab-key";

/**
 * Random identifier for this device. It never leaves the device in the
 * clear for storage: the server keeps only a salted hash (a pseudonym).
 */
export function deviceId(): string {
  let id = readString(STORAGE_KEYS.device);
  if (!id) {
    id = crypto.randomUUID();
    writeString(STORAGE_KEYS.device, id);
  }
  return id;
}

/** Starts a fresh pseudonym; past reports stay tied to the old one. */
export function resetDeviceId(): void {
  writeString(STORAGE_KEYS.device, crypto.randomUUID());
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set(DEVICE_HEADER, deviceId());
  const labKey = readString(STORAGE_KEYS.labKey);
  if (labKey && path.startsWith("/api/lab")) headers.set(LAB_KEY_HEADER, labKey);
  if (init.body) headers.set("content-type", "application/json");
  const response = await fetch(path, { ...init, headers, cache: "no-store" });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(response.status, body.error ?? `Request failed (${response.status})`);
  return body as T;
}

export interface ReportInput {
  category: ReportCategory;
  kind?: ReportKind;
  stop_id: string;
  route_id?: string | null;
  details?: ReportDetails;
  observed_minutes_ago?: number;
  location?: { lat: number; lng: number; accuracy_m: number } | null;
}

export interface ReportReceipt {
  report: Report;
  event_status: EventStatus | "withdrawn";
  event_id: string | null;
  confidence: number | null;
}

export interface ContributorSummary {
  contributor: string;
  reputation: Reputation;
  reports: ReportReceipt[];
  ride_segments: number;
}

export const api = {
  conditions: (at?: string) =>
    request<ConditionsSnapshot>(`/api/conditions${at ? `?at=${encodeURIComponent(at)}` : ""}`),
  submitReport: (input: ReportInput) =>
    request<ReportReceipt>("/api/reports", { method: "POST", body: JSON.stringify(input) }),
  withdrawReport: (id: string) =>
    request<ReportReceipt>(`/api/reports/${encodeURIComponent(id)}`, { method: "DELETE" }),
  me: () => request<ContributorSummary>("/api/me"),
  eraseMe: () => request<{ erased_reports: number; erased_segments: number }>("/api/me", { method: "DELETE" }),
  submitTrace: (body: { route_id: string; segments: DerivedSegment[]; quality: TraceQuality; consent: true }) =>
    request<{ trace_id: string; accepted: number; rejected: string[] }>("/api/traces", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  lab: <T>() => request<T>("/api/lab"),
  labPost: <T>(path: string, body: unknown) =>
    request<T>(`/api/lab/${path}`, { method: "POST", body: JSON.stringify(body) }),
  labDelete: <T>(path: string) => request<T>(`/api/lab/${path}`, { method: "DELETE" }),
};
