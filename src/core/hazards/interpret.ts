import type { HazardNotice, OfficialObservation } from "@/core/hazards/types";
import { OFFICIAL_CREDIBILITY, SITE_FACTOR } from "@/core/sensing/policy";
import type { Evidence } from "@/core/sensing/types";
import { haversineKm } from "@/core/transit/geo";
import type { Stop } from "@/core/transit/types";

/** A sensor reading describes conditions for this long after it was taken. */
export const SENSOR_VALIDITY_MINS = 60;
/** Advisories without an explicit end stay active this long. */
export const ADVISORY_DEFAULT_VALIDITY_MINS = 6 * 60;
/** Readings this far above threshold indicate impassable flooding. */
const IMPASSABLE_RATIO = 1.5;

/** Temporal interpretation: is the record still describing the present? */
export function isActive(observation: OfficialObservation, now: Date): boolean {
  const observed = new Date(observation.observed_at).getTime();
  if (observed > now.getTime()) return false;
  if (observation.kind === "hazard_context") return true;
  if (observation.valid_until) return now.getTime() <= new Date(observation.valid_until).getTime();
  const validity =
    observation.kind === "sensor_reading" ? SENSOR_VALIDITY_MINS : ADVISORY_DEFAULT_VALIDITY_MINS;
  return now.getTime() - observed <= validity * 60_000;
}

/** Spatial interpretation: stops inside the record's stated area. */
export function affectedStops(observation: OfficialObservation, stops: readonly Stop[]): Stop[] {
  return stops.filter((stop) => haversineKm(stop, observation.area) <= observation.area.radius_km);
}

export function exceedsThreshold(observation: OfficialObservation): boolean {
  return (
    observation.kind === "sensor_reading" &&
    observation.reading !== undefined &&
    observation.reading.value >= observation.reading.threshold
  );
}

/**
 * Only a timestamped sensor reading above its threshold becomes evidence of
 * flooding at nearby stops. Advisories and susceptibility maps contextualize
 * reports but are not interchangeable with a current observation.
 */
export function officialEvidence(
  observations: readonly OfficialObservation[],
  stops: readonly Stop[],
  now: Date
): Evidence[] {
  return observations
    .filter((observation) => isActive(observation, now) && exceedsThreshold(observation))
    .flatMap((observation) => {
      const reading = observation.reading!;
      const level = reading.value >= reading.threshold * IMPASSABLE_RATIO ? "impassable" : "passable";
      return affectedStops(observation, stops).map(
        (stop): Evidence => ({
          id: `${observation.id}@${stop.id}`,
          source_key: `official:${observation.source}:${observation.id}`,
          origin: "official",
          kind: "observation",
          category: "flooding",
          stop_id: stop.id,
          route_id: null,
          details: { flood_level: level },
          observed_at: observation.observed_at,
          submitted_at: observation.observed_at,
          credibility: OFFICIAL_CREDIBILITY[observation.connection],
          site_factor: SITE_FACTOR.on_site,
          official: { source: observation.source, connection: observation.connection },
          replay: observation.replay !== null,
        })
      );
    });
}

export function hazardNotices(
  observations: readonly OfficialObservation[],
  stops: readonly Stop[],
  now: Date
): HazardNotice[] {
  return observations
    .filter((observation) => isActive(observation, now))
    .map((observation) => ({
      observation_id: observation.id,
      source: observation.source,
      kind: observation.kind,
      title: observation.title,
      summary: observation.summary,
      area_label: observation.area.label,
      affected_stop_ids: affectedStops(observation, stops).map((stop) => stop.id),
      observed_at: observation.observed_at,
      valid_until: observation.valid_until,
      connection: observation.connection,
      used_as_evidence: exceedsThreshold(observation),
      replay: observation.replay !== null,
    }));
}
