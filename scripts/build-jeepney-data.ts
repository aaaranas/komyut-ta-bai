/**
 * Builds planner-ready stops and routes from the scraped Cebu City jeepney
 * directions in src/data/experimental/cebu-city-jeepneys.ts.
 *
 * Each landmark in a route's most detailed path is geocoded against OSM
 * Nominatim (bounded to Metro Cebu, 1.1 s between requests per usage
 * policy; results cached in scripts/.geocode-cache.json so reruns are
 * cheap). Landmarks that fail to geocode are dropped from the path.
 *
 * Output: src/data/generated/jeepney-stops.ts and jeepney-routes.ts.
 * Run with: npx tsx scripts/build-jeepney-data.ts
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { experimentalJeepneyRoutes } from "../src/data/experimental/cebu-city-jeepneys";
import { haversineKm } from "../src/lib/utils/geo";

const CACHE_PATH = join(__dirname, ".geocode-cache.json");
const OUT_DIR = join(__dirname, "..", "src", "data", "generated");
// Metro Cebu + Mactan (lng1,lat1,lng2,lat2)
const VIEWBOX = "123.75,10.20,124.06,10.50";
const USER_AGENT =
  "komyut-ta-bai/0.1 (transit data research; andrearanas87@gmail.com)";

// Average city jeepney pace, stops included (~13 km/h).
const MINS_PER_KM = 4.5;
// LTFRB-style traditional jeepney fare approximation.
const BASE_FARE = 13;
const PER_KM = 1.8;
// A stop geocoded farther than this from a route's median center is treated
// as a mis-geocode and dropped from that route.
const OUTLIER_KM = 6;

/** Typo/variant fixes applied after generic normalization. */
const ALIASES: Record<string, string> = {
  "e mall": "elizabeth mall",
  "e-mall": "elizabeth mall",
  emall: "elizabeth mall",
  "leaon kilat st": "leon kilat st",
  "l kilat st": "leon kilat st",
  "collonade supermarket": "colonnade supermarket",
  "collonade mall": "colonnade supermarket",
  "colonnade mall": "colonnade supermarket",
  "metro gaisano (colon)": "metro gaisano colon",
  "metro colon": "metro gaisano colon",
  sm: "sm city cebu",
  "sm cebu": "sm city cebu",
  "sm city": "sm city cebu",
  uv: "university of the visayas",
  "legaspit st": "legaspi st",
  "sancianko st": "sanciangko st",
  "s osmena blvd": "osmena blvd",
  "sergio osmena blvd": "osmena blvd",
  "north bus terminal": "cebu north bus terminal",
  "south bus terminal": "cebu south bus terminal",
  ccmc: "cebu city medical center",
  citu: "cebu institute of technology university",
  "cit-u": "cebu institute of technology university",
  nso: "philippine statistics authority cebu",
  cicc: "cebu international convention center",
  "usc-girls high": "university of san carlos girls high school",
  "usc- girls high": "university of san carlos girls high school",
};

/** Landmarks that already exist in the curated dataset. */
const EXISTING_STOP_IDS: Record<string, string> = {
  "cebu north bus terminal": "cnbt",
  "cebu south bus terminal": "csbt",
  "colon st": "colon",
};

function normalize(raw: string): string {
  let s = raw
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ") // parentheticals like "(PRIVATE)"
    .replace(/[.']/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[-.,\s]+$/, "");
  s = ALIASES[s] ?? s;
  return s;
}

function slugify(name: string): string {
  return (
    "cj-" +
    name
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48)
  );
}

function titleCase(name: string): string {
  const small = new Set(["of", "the", "del", "de", "and"]);
  return name
    .split(" ")
    .map((w, i) =>
      !small.has(w) || i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w
    )
    .join(" ")
    .replace(/\bSt\b/, "St.")
    .replace(/\bAve\b/, "Ave.")
    .replace(/\bBlvd\b/, "Blvd.");
}

interface CacheEntry {
  lat: number;
  lng: number;
  display: string;
  city: string;
}

type Cache = Record<string, CacheEntry | null>;

function loadCache(): Cache {
  try {
    return JSON.parse(readFileSync(CACHE_PATH, "utf8"));
  } catch {
    return {};
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function geocodeOnce(query: string): Promise<CacheEntry | null> {
  const url =
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&bounded=1` +
    `&viewbox=${VIEWBOX}&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) {
    console.warn(`  HTTP ${res.status} for "${query}", backing off 10 s`);
    await sleep(10_000);
    return null;
  }
  const json = (await res.json()) as {
    lat: string;
    lon: string;
    display_name: string;
  }[];
  if (!json[0]) return null;
  return {
    lat: Number(Number(json[0].lat).toFixed(6)),
    lng: Number(Number(json[0].lon).toFixed(6)),
    display: json[0].display_name,
    city: query.split(", ").slice(-2)[0],
  };
}

async function geocode(
  name: string,
  preferMactan: boolean,
  cache: Cache
): Promise<CacheEntry | null> {
  if (name in cache) return cache[name];
  const cities = preferMactan
    ? ["Lapu-Lapu City, Cebu", "Mandaue City, Cebu", "Cebu City"]
    : ["Cebu City", "Mandaue City, Cebu", "Lapu-Lapu City, Cebu"];
  let result: CacheEntry | null = null;
  for (const city of cities) {
    result = await geocodeOnce(`${name}, ${city}, Philippines`);
    await sleep(1100);
    if (result) break;
  }
  cache[name] = result;
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 1));
  return result;
}

interface ParsedRoute {
  code: string;
  landmarks: string[];
  preferMactan: boolean;
}

function parseRoutes(): ParsedRoute[] {
  const parsed: ParsedRoute[] = [];
  for (const route of experimentalJeepneyRoutes) {
    if (route.paths.length === 0) continue;
    const best = route.paths.reduce((a, b) =>
      (b.match(/ - /g) || []).length > (a.match(/ - /g) || []).length ? b : a
    );
    const landmarks = best
      .split(" - ")
      .map(normalize)
      .filter((s) => s.length > 1 && !/^(and )?vice versa/.test(s));
    // Collapse consecutive duplicates left by normalization.
    const deduped = landmarks.filter((s, i) => s !== landmarks[i - 1]);
    if (deduped.length < 2) continue;
    parsed.push({
      code: route.code,
      landmarks: deduped,
      preferMactan: route.code.startsWith("MI-"),
    });
  }
  return parsed;
}

async function main() {
  const parsed = parseRoutes();
  const allLandmarks = new Map<string, boolean>(); // name -> preferMactan
  for (const route of parsed) {
    for (const lm of route.landmarks) {
      if (!allLandmarks.has(lm)) allLandmarks.set(lm, route.preferMactan);
    }
  }
  console.log(
    `${parsed.length} routes, ${allLandmarks.size} unique landmarks to geocode`
  );

  const cache = loadCache();
  let done = 0;
  for (const [name, preferMactan] of allLandmarks) {
    const hit = name in cache;
    await geocode(name, preferMactan, cache);
    done++;
    if (!hit && done % 25 === 0) {
      const ok = [...allLandmarks.keys()].filter((n) => cache[n]).length;
      console.log(`  ${done}/${allLandmarks.size} (${ok} resolved)`);
    }
  }

  // Build stops: unique geocoded landmarks not already in the curated set.
  const stopIdByName = new Map<string, string>();
  const generatedStops: {
    id: string;
    name: string;
    lat: number;
    lng: number;
    municipality: string;
    type: "street_stop";
  }[] = [];
  const usedIds = new Set<string>(Object.values(EXISTING_STOP_IDS));
  for (const name of allLandmarks.keys()) {
    const entry = cache[name];
    if (!entry) continue;
    if (EXISTING_STOP_IDS[name]) {
      stopIdByName.set(name, EXISTING_STOP_IDS[name]);
      continue;
    }
    let id = slugify(name);
    while (usedIds.has(id)) id += "-2";
    usedIds.add(id);
    stopIdByName.set(name, id);
    generatedStops.push({
      id,
      name: titleCase(name),
      lat: entry.lat,
      lng: entry.lng,
      municipality: entry.city.replace(/, Cebu$/, ""),
      type: "street_stop",
    });
  }

  // Coordinate lookup across curated corridor stops and generated landmarks.
  const curatedCoords: Record<string, { lat: number; lng: number }> = {
    cnbt: { lat: 10.3113, lng: 123.9175 },
    csbt: { lat: 10.298, lng: 123.894 },
    colon: { lat: 10.2966, lng: 123.9009 },
  };
  const generatedById = new Map(generatedStops.map((s) => [s.id, s]));
  const coordOf = (id: string): { lat: number; lng: number } =>
    curatedCoords[id] ?? generatedById.get(id)!;

  const median = (values: number[]): number => {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  };

  /**
   * Drops stops geocoded implausibly far from the route's center. A city
   * jeepney route is geographically compact, so a landmark that resolved to
   * the wrong part of Cebu shows up as an outlier from the median position.
   */
  function rejectOutliers(ids: string[]): { kept: string[]; removed: string[] } {
    const points = ids.map(coordOf);
    const centerLat = median(points.map((p) => p.lat));
    const centerLng = median(points.map((p) => p.lng));
    const kept: string[] = [];
    const removed: string[] = [];
    ids.forEach((id, i) => {
      const km = haversineKm(points[i].lat, points[i].lng, centerLat, centerLng);
      if (km > OUTLIER_KM) removed.push(id);
      else kept.push(id);
    });
    return { kept, removed };
  }

  // Build routes from geocoded landmarks (drop misses, outliers, then dedupe).
  const generatedRoutes: object[] = [];
  const dropped: string[] = [];
  const outliersRemoved: string[] = [];
  for (const route of parsed) {
    const geocoded = route.landmarks
      .map((lm) => stopIdByName.get(lm))
      .filter((id): id is string => Boolean(id))
      .filter((id, i, arr) => id !== arr[i - 1]);

    const { kept, removed } = rejectOutliers(geocoded);
    outliersRemoved.push(...removed);
    const ids = kept.filter((id, i, arr) => id !== arr[i - 1]);
    if (new Set(ids).size < 2) {
      dropped.push(route.code);
      continue;
    }

    let totalKm = 0;
    for (let i = 0; i < ids.length - 1; i++) {
      const a = coordOf(ids[i]);
      const b = coordOf(ids[i + 1]);
      totalKm += haversineKm(a.lat, a.lng, b.lat, b.lng);
    }
    const source = experimentalJeepneyRoutes.find(
      (r) => r.code === route.code
    )!;
    const nameOf = (id: string): string =>
      generatedById.get(id)?.name ?? id.toUpperCase();
    const firstName = nameOf(ids[0]);
    const lastName = nameOf(ids[ids.length - 1]);
    generatedRoutes.push({
      id: `cj-${route.code.toLowerCase()}`,
      name: `Jeepney ${route.code} ${firstName}–${lastName}`,
      mode: "jeepney",
      operator: "Traditional jeepney (various operators)",
      stops: ids.map((stop_id, i) => ({ stop_id, sequence: i + 1 })),
      fare: { base_fare: BASE_FARE, per_km: PER_KM },
      duration_mins: Math.max(10, Math.round(totalKm * MINS_PER_KM)),
      frequency_mins: 10,
      first_trip: "05:00",
      last_trip: "21:00",
      verified_date: source.fetched_date,
      unverified: true,
      source_url: source.source_url,
    });
  }

  // Keep only stops still referenced by a route after outlier rejection.
  const referencedIds = new Set<string>();
  for (const route of generatedRoutes as { stops: { stop_id: string }[] }[]) {
    for (const { stop_id } of route.stops) referencedIds.add(stop_id);
  }
  const finalStops = generatedStops.filter((s) => referencedIds.has(s.id));

  mkdirSync(OUT_DIR, { recursive: true });
  const banner = (what: string) =>
    `// GENERATED by scripts/build-jeepney-data.ts — do not edit by hand.\n` +
    `// ${what} derived from src/data/experimental/cebu-city-jeepneys.ts\n` +
    `// via OSM Nominatim geocoding. Positions are approximate and the\n` +
    `// routes are unverified; see README "Promoting experimental routes".\n`;
  writeFileSync(
    join(OUT_DIR, "jeepney-stops.ts"),
    banner("Stops") +
      `import type { Stop } from "@/lib/types";\n\n` +
      `export const jeepneyStops: Stop[] = ${JSON.stringify(finalStops, null, 2)};\n`
  );
  writeFileSync(
    join(OUT_DIR, "jeepney-routes.ts"),
    banner("Routes") +
      `import type { Route } from "@/lib/types";\n\n` +
      `export const jeepneyRoutes: Route[] = ${JSON.stringify(generatedRoutes, null, 2)};\n`
  );

  const resolved = [...allLandmarks.keys()].filter((n) => cache[n]).length;
  console.log(`\nGeocoded ${resolved}/${allLandmarks.size} landmarks`);
  console.log(
    `Wrote ${finalStops.length} stops, ${generatedRoutes.length} routes`
  );
  console.log(
    `Rejected ${outliersRemoved.length} outlier stop refs (>${OUTLIER_KM}km from route center)`
  );
  if (dropped.length > 0) {
    console.log(`Dropped (under 2 geocoded stops): ${dropped.join(", ")}`);
  }
}

main();
