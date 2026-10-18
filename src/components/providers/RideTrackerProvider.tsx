"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { hopMinutes } from "@/core/planner";
import { deriveSegments, type TracePoint } from "@/core/sensing/traces";
import { getRoute, orderedStopsOf } from "@/core/transit/catalog";
import { useConsent } from "@/hooks/useConsent";
import { api } from "@/lib/api";

export type TrackerResult =
  | { status: "sent"; accepted: number; rejected: string[] }
  | { status: "nothing"; message: string }
  | { status: "error"; message: string };

interface TrackerValue {
  /** Route being traced, if any. */
  routeId: string | null;
  startedAt: number | null;
  pointCount: number;
  result: TrackerResult | null;
  error: string | null;
  start: (routeId: string) => void;
  /** Stops tracing; when `send` is true, derived segments are submitted. */
  stop: (send: boolean) => Promise<void>;
  dismissResult: () => void;
}

const RideTrackerContext = createContext<TrackerValue | null>(null);

/** Tracing stops automatically after this long. */
const MAX_TRACE_MS = 3 * 60 * 60_000;

/**
 * Consent-based ride tracing. GPS fixes are held in memory only, reduced
 * on the device to stop-to-stop times, and only those segments are sent.
 * Nothing runs unless the rider opted in and pressed "Share ride time".
 */
export function RideTrackerProvider({ children }: { children: React.ReactNode }) {
  const consent = useConsent();
  const [routeId, setRouteId] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [pointCount, setPointCount] = useState(0);
  const [result, setResult] = useState<TrackerResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const points = useRef<TracePoint[]>([]);
  const watchId = useRef<number | null>(null);

  const clearWatch = useCallback(() => {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = null;
  }, []);

  const reset = useCallback(() => {
    clearWatch();
    points.current = [];
    setRouteId(null);
    setStartedAt(null);
    setPointCount(0);
  }, [clearWatch]);

  const start = useCallback(
    (nextRouteId: string) => {
      if (!consent.rideTraces) {
        setError("Turn on ride-time sharing in Privacy first.");
        return;
      }
      if (!("geolocation" in navigator)) {
        setError("This device cannot share its location.");
        return;
      }
      reset();
      setError(null);
      setResult(null);
      setRouteId(nextRouteId);
      setStartedAt(Date.now());
      watchId.current = navigator.geolocation.watchPosition(
        (position) => {
          points.current.push({
            t: position.timestamp,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy_m: position.coords.accuracy,
          });
          setPointCount(points.current.length);
        },
        () => setError("Location is unavailable. Check that location access is allowed."),
        { enableHighAccuracy: true, maximumAge: 5_000, timeout: 30_000 }
      );
    },
    [consent.rideTraces, reset]
  );

  const stop = useCallback(
    async (send: boolean) => {
      const route = routeId ? getRoute(routeId) : undefined;
      const captured = points.current;
      reset();
      if (!send || !route) return;
      const { segments, quality } = deriveSegments(route, orderedStopsOf(route), captured, (from, to) =>
        hopMinutes(route.id, from, to)
      );
      if (segments.length === 0) {
        setResult({
          status: "nothing",
          message: "No complete stop-to-stop segment was recorded, so nothing was sent.",
        });
        return;
      }
      try {
        const response = await api.submitTrace({ route_id: route.id, segments, quality, consent: true });
        setResult({ status: "sent", accepted: response.accepted, rejected: response.rejected });
      } catch (caught) {
        setResult({ status: "error", message: caught instanceof Error ? caught.message : "Could not send." });
      }
    },
    [routeId, reset]
  );

  // Withdrawing consent stops the GPS watch and drops captured fixes at once.
  useEffect(() => {
    if (consent.rideTraces) return;
    clearWatch();
    points.current = [];
  }, [consent.rideTraces, clearWatch]);

  // A forgotten trace ends (and is sent) after the maximum duration.
  useEffect(() => {
    if (!routeId || startedAt === null || !consent.rideTraces) return;
    const timer = setTimeout(() => void stop(true), MAX_TRACE_MS - (Date.now() - startedAt));
    return () => clearTimeout(timer);
  }, [consent.rideTraces, routeId, startedAt, stop]);

  useEffect(() => clearWatch, [clearWatch]);

  const tracking = consent.rideTraces ? routeId : null;
  const value = useMemo<TrackerValue>(
    () => ({
      routeId: tracking,
      startedAt,
      pointCount,
      result,
      error,
      start,
      stop,
      dismissResult: () => {
        setResult(null);
        setError(null);
      },
    }),
    [tracking, startedAt, pointCount, result, error, start, stop]
  );

  return <RideTrackerContext.Provider value={value}>{children}</RideTrackerContext.Provider>;
}

export function useRideTracker(): TrackerValue {
  const value = useContext(RideTrackerContext);
  if (!value) throw new Error("useRideTracker must be used inside RideTrackerProvider");
  return value;
}
