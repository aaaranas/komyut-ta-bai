import { PHILSENSORS_SOURCE } from "@/core/hazards/sources";
import type { HazardSourceStatus, OfficialObservation } from "@/core/hazards/types";

/** Feature flag: list the PhilSensors adapter at all. */
export const philSensorsEnabled = () => process.env.KOMYUT_ENABLE_PHILSENSORS === "true";

/**
 * PhilSensors adapter stub. Until API access is granted it never calls the
 * network and always reports "not_connected", whether or not
 * PHILSENSORS_API_KEY is set. When access is granted, the reading fetch goes
 * in `philSensorsReadings` and must label its records `connection: "live"`
 * only for data actually received from the API.
 */
export function philSensorsStatus(): HazardSourceStatus | null {
  if (!philSensorsEnabled()) return null;
  const keySet = Boolean(process.env.PHILSENSORS_API_KEY);
  return {
    ...PHILSENSORS_SOURCE,
    status: "not_connected",
    checked_at: null,
    disclosure: keySet
      ? "An API key is configured, but access has not been confirmed, so no readings are requested."
      : "Not connected: waiting for API access (set PHILSENSORS_API_KEY once granted).",
  };
}

export async function philSensorsReadings(): Promise<OfficialObservation[]> {
  return [];
}
