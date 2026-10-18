/**
 * Cebu province bounding box used for data validation. The eastern bound
 * extends to 124.4°E (past the mainland's ~124.1°E) so the Camotes
 * Islands are included.
 */
export const CEBU_BOUNDS = {
  minLat: 9.4,
  maxLat: 11.3,
  minLng: 123.2,
  maxLng: 124.4,
} as const;

const EARTH_RADIUS_KM = 6371;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export interface LatLng {
  lat: number;
  lng: number;
}

/** Great-circle distance in kilometres. */
export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.lat)) *
      Math.cos(toRadians(b.lat)) *
      Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export function isWithinCebu({ lat, lng }: LatLng): boolean {
  return (
    lat >= CEBU_BOUNDS.minLat &&
    lat <= CEBU_BOUNDS.maxLat &&
    lng >= CEBU_BOUNDS.minLng &&
    lng <= CEBU_BOUNDS.maxLng
  );
}

/** The `count` items closest to `point`, nearest first. */
export function nearest<T extends LatLng>(
  point: LatLng,
  items: readonly T[],
  count: number
): { item: T; km: number }[] {
  return items
    .map((item) => ({ item, km: haversineKm(point, item) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, count);
}
