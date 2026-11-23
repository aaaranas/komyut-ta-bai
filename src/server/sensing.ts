import { forecastEffects, type WeatherSnapshot } from "@/core/hazards/rainfall";
import { HAZARD_SOURCES, disconnectedStatus } from "@/core/hazards/sources";
import { hazardNotices, officialEvidence } from "@/core/hazards/interpret";
import { deriveEvents, isActiveEvent, reportEvidence } from "@/core/sensing/events";
import { describeEffect, eventEffect, travelTimeEffects, type EffectContext } from "@/core/sensing/effects";
import { POLICY_VERSION } from "@/core/sensing/policy";
import { buildReputations } from "@/core/sensing/reputation";
import { aggregateTravelTimes } from "@/core/sensing/traces";
import type { Evidence, Reputation, TransitEvent } from "@/core/sensing/types";
import type { ConditionsSnapshot, PublicEvent, StorageMode } from "@/core/snapshot";
import { getRoute, stops } from "@/core/transit/catalog";
import { routeCode } from "@/core/transit/naming";
import { headwayAt } from "@/core/transit/service";
import { cebuDepartureTime } from "@/core/transit/time";
import { store, type Database } from "@/server/store";

export interface SensingState {
  reputations: Map<string, Reputation>;
  evidence: Evidence[];
  events: TransitEvent[];
}

/** The verification pipeline over stored data, evaluated at `now`. */
export function evaluateSensing(db: Readonly<Database>, now: Date): SensingState {
  const reputations = buildReputations(db.reports, db.labels, now);
  const evidence = [
    ...reportEvidence(db.reports, reputations),
    ...officialEvidence(db.official, stops, now),
  ];
  return { reputations, evidence, events: deriveEvents(evidence, now) };
}

function effectContext(now: Date): EffectContext {
  const { dow, minutes } = cebuDepartureTime(now);
  return { getRoute, headwayOf: (route) => headwayAt(route, minutes, dow) };
}

export function publicEvent(event: TransitEvent, now: Date): PublicEvent {
  const effect = eventEffect(event, effectContext(now));
  const route = event.route_id ? getRoute(event.route_id) : undefined;
  const routeName = route ? routeCode(route) : undefined;
  return { ...event, effect, consequence: describeEffect(effect, routeName) };
}

export function buildSnapshot(
  db: Readonly<Database>,
  now: Date,
  storage: StorageMode,
  weather: WeatherSnapshot | null = null
): ConditionsSnapshot {
  const { events } = evaluateSensing(db, now);
  const published = events.filter(isActiveEvent).map((event) => publicEvent(event, now));
  const travelTimes = aggregateTravelTimes(db.segments, now);
  return {
    generated_at: new Date().toISOString(),
    as_of: now.toISOString(),
    storage,
    policy_version: POLICY_VERSION,
    events: published,
    effects: [
      ...published.flatMap((event) => (event.effect ? [event.effect] : [])),
      ...travelTimeEffects(travelTimes),
      ...(weather?.status === "ok" ? forecastEffects(weather.alerts) : []),
    ],
    travel_times: travelTimes,
    hazards: {
      sources: HAZARD_SOURCES.map(disconnectedStatus),
      notices: hazardNotices(db.official, stops, now),
    },
    weather,
  };
}

/**
 * Objective 4(b): stamps, from the server clock, the first route response
 * (conditions snapshot) that carried each published event. Writes only when
 * a snapshot carries an event not yet stamped.
 */
export async function markRouteResponses(snapshot: ConditionsSnapshot): Promise<void> {
  if (snapshot.events.length === 0) return;
  const at = snapshot.generated_at;
  const marked = await store.read((db) => new Set(db.propagation.map((mark) => mark.event_id)));
  const fresh = snapshot.events.filter((event) => !marked.has(event.id));
  if (fresh.length === 0) return;
  await store.write((db) => {
    const known = new Set(db.propagation.map((mark) => mark.event_id));
    for (const event of fresh) {
      if (known.has(event.id)) continue;
      db.propagation.push({ event_id: event.id, source_at: event.first_submitted_at, first_route_response_at: at });
    }
  });
}
