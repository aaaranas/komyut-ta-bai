import { HAZARD_SOURCES, disconnectedStatus } from "@/core/hazards/sources";
import { hazardNotices, officialEvidence } from "@/core/hazards/interpret";
import { deriveEvents, isActiveEvent, reportEvidence } from "@/core/sensing/events";
import { describeEffect, eventEffect, travelTimeEffects, type EffectContext } from "@/core/sensing/effects";
import { POLICY_VERSION } from "@/core/sensing/policy";
import { buildReputations } from "@/core/sensing/reputation";
import { aggregateTravelTimes } from "@/core/sensing/traces";
import type { Reputation, TransitEvent } from "@/core/sensing/types";
import type { ConditionsSnapshot, PublicEvent, StorageMode } from "@/core/snapshot";
import { getRoute, stops } from "@/core/transit/catalog";
import { headwayAt } from "@/core/transit/service";
import { cebuDepartureTime } from "@/core/transit/time";
import type { Database } from "@/server/store";

export interface SensingState {
  reputations: Map<string, Reputation>;
  events: TransitEvent[];
}

/** The verification pipeline over stored data, evaluated at `now`. */
export function evaluateSensing(db: Readonly<Database>, now: Date): SensingState {
  const reputations = buildReputations(db.reports, db.labels, now);
  const evidence = [
    ...reportEvidence(db.reports, reputations),
    ...officialEvidence(db.official, stops, now),
  ];
  return { reputations, events: deriveEvents(evidence, now) };
}

function effectContext(now: Date): EffectContext {
  const { dow, minutes } = cebuDepartureTime(now);
  return { getRoute, headwayOf: (route) => headwayAt(route, minutes, dow) };
}

export function publicEvent(event: TransitEvent, now: Date): PublicEvent {
  const effect = eventEffect(event, effectContext(now));
  const routeName = event.route_id ? getRoute(event.route_id)?.name : undefined;
  return { ...event, effect, consequence: describeEffect(effect, routeName) };
}

export function buildSnapshot(db: Readonly<Database>, now: Date, storage: StorageMode): ConditionsSnapshot {
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
    ],
    travel_times: travelTimes,
    hazards: {
      sources: HAZARD_SOURCES.map(disconnectedStatus),
      notices: hazardNotices(db.official, stops, now),
    },
  };
}
