# Komyut ta Bai 🚌⛴️

**Asa ta, Bai?** — A province-wide multimodal public transport planner for Cebu, Philippines.

Type an origin and destination (e.g. *Argao* → *Santa Fe, Bantayan Island*) and get a multi-leg journey plan: which buses, v-hires, jeepneys, and ferries to take, where to transfer, total fare, and total travel time. Think Google Maps transit directions — but for Cebu province, where Google has zero coverage.

Everything runs client-side. No backend, no API calls, and the app works fully offline after your first visit (it's an installable PWA).

## Coverage

- **Southern corridor:** Argao → Sibonga → Carcar → Naga → Minglanilla → Cebu South Bus Terminal (Ceres bus and v-hire)
- **Northern corridor:** Cebu North Bus Terminal → Consolacion → Liloan → Compostela → Danao → Carmen → Catmon → Sogod → Borbon → Tabuelan → San Remigio → Hagnaya port (Ceres bus)
- **Island links:** Hagnaya → Santa Fe (Bantayan) ferry, Danao → Consuelo (Camotes) ferry
- **Key transfers:** CSBT ↔ CNBT cross-city, bus drop-offs ↔ ports
- **Cebu City / Mandaue / Mactan jeepneys (unverified):** ~60 routes scraped from [cebujeepneys.weebly.com](https://cebujeepneys.weebly.com/jeepney-routes.html), with stops geocoded via OSM Nominatim. These ARE used by the planner but flagged *unverified* throughout the UI — positions, fares, and times are approximations pending field checks.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, static generation) + TypeScript
- [Tailwind CSS 4](https://tailwindcss.com)
- [MapLibre GL](https://maplibre.org) with OpenStreetMap raster tiles
- [Serwist](https://serwist.pages.dev) service worker for offline/PWA
- Dijkstra-based journey planner over an in-memory transit graph

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Note: the service worker is disabled in dev; offline behavior only applies to production builds.

## Validating data

Every change to the transit dataset should pass the integrity checks (orphan stop references, duplicate IDs, out-of-province coordinates, malformed routes, negative fares):

```bash
npm run validate
```

## Production build

```bash
npm run build
npm start
```

## Project layout

```
src/lib/types.ts      Domain types (Stop, Route, Transfer, Leg, JourneyResult)
src/data/             The transit dataset (stops, routes, transfers)
src/lib/graph.ts      Builds the adjacency graph at import time
src/lib/planner.ts    Dijkstra planner (fastest / cheapest)
src/components/       Map, search form, PWA UI
scripts/              Data validation + icon generation
```

## Contributing data

The dataset lives in plain TypeScript files under [`src/data/`](src/data/) — no database required. To add or correct a route:

1. Add any new stops to `src/data/stops.ts` with real coordinates (from OpenStreetMap) and the correct `municipality` and `type`.
2. Add the route to `src/data/routes.ts` with ordered stops, fare structure (`per_km` or `flat`), end-to-end duration, frequency, and first/last trip times.
3. If a connection requires walking between stops (e.g. terminal → port), add it to `src/data/transfers.ts`.
4. Set `verified_date` to the date you personally confirmed the schedule/fare.
5. Run `npm run validate` and open a pull request describing how you verified the data (rode the route, asked the dispatcher, official fare matrix, etc.).

> ⚠️ Fares and schedules in Cebu change often. Data with a `verified_date` older than a year should be treated as suspect — re-verification PRs are the most valuable contribution of all.

### The generated jeepney network

The city jeepney data is a three-stage pipeline:

1. `src/data/experimental/cebu-city-jeepneys.ts` — raw scraped route descriptions (the source of truth for regeneration).
2. `npx tsx scripts/build-jeepney-data.ts` — normalizes landmark names, geocodes them via OSM Nominatim (cached in `scripts/.geocode-cache.json`, ~1 req/s per usage policy), and writes `src/data/generated/jeepney-stops.ts` + `jeepney-routes.ts`.
3. The generated files are merged into the main dataset with `unverified: true`, which the UI surfaces as amber badges.

To promote a route to verified: ride it, correct its stops/coordinates and fare, move it into `src/data/routes.ts` (dropping the `unverified` flag, setting a real `verified_date`), and remove the raw entry so the generator stops emitting it. To fix a single wrong stop position, correct the entry in `scripts/.geocode-cache.json` and re-run the generator — don't edit the generated files directly.
