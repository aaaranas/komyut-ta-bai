import type { HazardSourceInfo, HazardSourceStatus } from "@/core/hazards/types";

/** The only hazard sources in scope (Chapter 1.5.3). */
export const HAZARD_SOURCES: readonly HazardSourceInfo[] = [
  {
    id: "pagasa",
    name: "PAGASA",
    products: ["Flood advisories", "Rainfall warnings", "Tropical cyclone bulletins"],
    kinds: ["advisory"],
    reference_url: "https://www.pagasa.dost.gov.ph/flood",
  },
  {
    id: "dost_asti",
    name: "DOST-ASTI",
    products: ["arQ water-level stations", "Rain gauges"],
    kinds: ["sensor_reading"],
    reference_url: "https://asti.dost.gov.ph/wireless-technology/arq/",
  },
  {
    id: "phivolcs",
    name: "PHIVOLCS / GeoRisk",
    products: ["HazardHunterPH susceptibility"],
    kinds: ["hazard_context"],
    reference_url: "https://hazardhunter.georisk.gov.ph/",
  },
];

/**
 * Feed status before any live integration is confirmed. Access terms,
 * Cebu coverage, and timestamp meaning still have to be verified, so every
 * source reports "not_connected" and says so; manually entered records are
 * labeled separately wherever they appear.
 */
export function disconnectedStatus(source: HazardSourceInfo): HazardSourceStatus {
  return {
    ...source,
    status: "not_connected",
    checked_at: null,
    disclosure:
      "No live feed is connected: access terms and Cebu coverage are still being confirmed. " +
      "Records from this source appear only when entered manually, and are labeled as such.",
  };
}
