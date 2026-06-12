import { CEBU_BOUNDS } from "@/lib/constants";

const EARTH_RADIUS_KM = 6371;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

/** Great-circle distance in kilometres. */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

export function isWithinCebu(lat: number, lng: number): boolean {
  return (
    lat >= CEBU_BOUNDS.minLat &&
    lat <= CEBU_BOUNDS.maxLat &&
    lng >= CEBU_BOUNDS.minLng &&
    lng <= CEBU_BOUNDS.maxLng
  );
}
