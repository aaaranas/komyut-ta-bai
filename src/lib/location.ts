export interface Fix {
  lat: number;
  lng: number;
  accuracy_m: number;
}

/** One location fix, or null when unavailable, denied, or too slow. */
export function currentLocation(timeoutMs = 8_000): Promise<Fix | null> {
  if (typeof navigator === "undefined" || !("geolocation" in navigator)) return Promise.resolve(null);
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy_m: position.coords.accuracy,
        }),
      () => resolve(null),
      { timeout: timeoutMs, maximumAge: 60_000, enableHighAccuracy: true }
    );
  });
}
