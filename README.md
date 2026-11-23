# Komyut ta Bai 🚌⛴️

**Asa ta, Bai?** — A multimodal transit planner for Metro Cebu with a participatory sensing layer.

Komyut ta Bai plans trips across Metro Cebu (7 cities and 6 municipalities) on MyBus, e-jeepneys, jeepneys (PUJ), V-hires, and the Metro Cebu stretches of provincial buses, using a curated dataset and a graph-based planner. Commuters report **delays, flooding, full vehicles, and road disruptions**. Those reports go through a verification layer, and a confidence-weighted, time-decayed score turns them into changes to the route graph. Every plan shows the baseline estimate next to the live-adjusted one.

It is the software artifact for the CMSC 198.1 thesis *“Komyut ta Bai: A Participatory Sensing Framework for Real-Time Transit Data Enrichment in Cebu’s Informal Public Transportation Network”* (UP Cebu). See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for how each research objective maps to code.

> **Scope: Metro Cebu** — the cities of Carcar, Cebu, Danao, Lapu-Lapu, Mandaue, Naga, and Talisay, and the municipalities of Compostela, Consolacion, Cordova, Liloan, Minglanilla, and San Fernando. Provincial buses are routed only along their Metro Cebu stops; ferries leaving the area are listed but not planned. No dataset record is deleted: out-of-scope records are flagged (`npm run validate` reports them).

## Features

- **Multimodal trip planning** — a time-dependent Dijkstra over a directed multigraph. It models service windows and headway-based waits, one fare per vehicle (LTFRB-style distance fares for PUJs), walking links between nearby stops, transfer limits, and fastest/cheapest modes.
- **Commuter reporting** — four categories, a few taps, prefilled from the trip you're on. You can withdraw a report at any time. Reporting and confirming need **Google sign-in**; planning never does. Other people see only a random nickname.
- **Verification layer** — beta reputation that changes only from independent labels, deduplication by pseudonym, confirmations weighted below observations, an on-site check from distance to the stop, and clearance reports.
- **Confidence-weighted, time-decayed scoring** — `C = 1 − ∏(1 − Rᵢ·e^(−Δtᵢ/τₖ))` with a decay constant per category. Events publish at θ_pub = 0.45 and expire below θ_exp = 0.30 (no flicker). Edge weights follow `w = w₀·(1 + αₖ·C)`, so they never fall below baseline; `w = ∞` only for an impassable event with C ≥ θ_block and independent agreement. Confirmed closures hold until someone reports them cleared.
- **Hazard information** — PAGASA, DOST-ASTI, and PHIVOLCS sources, each with its connection status stated. No live feed is claimed: records entered by hand are labeled "official (manual)". Advisories are shown as context only. A PhilSensors adapter stub waits behind a feature flag until API access is granted.
- **Rainfall forecast** — [Open-Meteo](https://open-meteo.com/) hourly rainfall at sample points across Metro Cebu, classified with PAGASA's color-coded rainfall warning thresholds (yellow ≥ 7.5, orange ≥ 15, red ≥ 30 mm/h). It is shown as "Forecast · Open-Meteo", may add a small allowance to nearby trip estimates, and can never close a road. Cached 15 minutes; on failure it says "unavailable" rather than showing zero rain. Weather data by Open-Meteo.com (CC BY 4.0).
- **Consent-based ride traces** — opt-in. Stop-to-stop times are computed on the phone, and raw GPS points never leave the device. Only medians are published, and only when at least 3 rides from at least 2 contributors back them.
- **Privacy center** — consent toggles, your pseudonym and reliability score, your reports, and "delete everything".
- **Research console** (`/lab`) — controlled replay scenarios, ground-truth labeling into separate development and test sets, field validation rides, and the Objective 4 metrics: MAE/MAPE with a Wilcoxon signed-rank test, propagation time (median and p90, from report receipt or feed observation to the first route response), and precision, recall, false admission and false rejection rates with 95% Wilson intervals for the confidence rule and a count-only rule, compared with McNemar's test. CSV export for rides, decisions, and propagation. Limited to researcher emails when sign-in is on.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router) + TypeScript + [Tailwind CSS 4](https://tailwindcss.com)
- [MapLibre GL](https://maplibre.org) with OpenStreetMap raster tiles
- [Serwist](https://serwist.pages.dev) service worker (installable on Android). Planning still works offline on the baseline dataset.
- Route handlers for the sensing API. Persistence: PostgreSQL through [Prisma](https://www.prisma.io) when `DATABASE_URL` is set (e.g. [Neon](https://neon.tech)), otherwise a JSON file store for local development
- [Auth.js](https://authjs.dev) with Google sign-in

## Running locally

```bash
npm install
npm run dev        # http://localhost:3000
```

| Command | What it does |
|---|---|
| `npm test` | Unit tests for the planner, verification, scoring, and traces (`node:test`) |
| `npm run validate` | Dataset integrity checks |
| `npm run lint` | ESLint |
| `npm run typecheck` | Route type generation + `tsc` |
| `npm run build && npm start` | Production build (the service worker is only active here) |

### Environment

Every variable is optional locally — with none set, the app runs in **dev mode** (device pseudonyms, no sign-in) on the JSON store. [`.env.example`](.env.example) documents each one.

| Variable | Purpose |
|---|---|
| `KOMYUT_PSEUDONYM_SALT` | Salt for pseudonyms and identity hashes. **Required on any shared deployment**; keep it stable. |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_SECRET` | Google sign-in. All three turn it on; otherwise dev mode. |
| `KOMYUT_RESEARCHER_EMAILS` | Comma-separated emails allowed into `/lab` when sign-in is on. |
| `KOMYUT_LAB_KEY` | Shared `/lab` key when sign-in is off. |
| `DATABASE_URL`, `DIRECT_URL` | PostgreSQL (pooled) and the direct URL used by migrations. Unset → JSON store. |
| `KOMYUT_DATA_DIR` | JSON store directory (default `./.data`). |
| `KOMYUT_WEATHER` | `off` skips the Open-Meteo forecast. |
| `KOMYUT_ENABLE_PHILSENSORS`, `PHILSENSORS_API_KEY` | PhilSensors adapter stub (always "not connected" for now). |

| Database command | What it does |
|---|---|
| `npm run db:migrate:deploy` | Applies `prisma/migrations` to the database in `DIRECT_URL`/`DATABASE_URL` |
| `npm run db:import-json -- [--dry-run] [--file path]` | One-time copy of the JSON store into Postgres (the file is left untouched) |

`npm install` runs `prisma generate`. Set `TEST_DATABASE_URL` to a **disposable** database to also run the store contract tests against Postgres.

## Deploying (Vercel + Neon, free tiers)

1. **Database.** Create a Neon project. Copy the pooled connection string (`DATABASE_URL`) and the direct one (`DIRECT_URL`). From your machine, run `DIRECT_URL=… npm run db:migrate:deploy` once to create the tables (and again whenever a new migration is added). To bring over local data: `DATABASE_URL=… npm run db:import-json`.
2. **Google sign-in.** In Google Cloud Console → APIs & Services → Credentials, create an OAuth client ID (Web application) with the redirect URI `https://<your-domain>/api/auth/callback/google` (add `http://localhost:3000/api/auth/callback/google` for local testing). Configure the OAuth consent screen with your app name and support email.
3. **Vercel.** Import the GitHub repository (framework: Next.js; the build command from `package.json` is used). Under Settings → Environment Variables, set `KOMYUT_PSEUDONYM_SALT`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `KOMYUT_RESEARCHER_EMAILS`, `DATABASE_URL`, and `DIRECT_URL`, then deploy.
4. **Check on an Android phone (Chrome).** Install the app from the browser menu, plan a trip, sign in, submit a flooding report, check the rainfall badge and the Open-Meteo attribution on Alerts, and, after the report is corroborated (a second account, or a lab replay), see the trip reroute.

## Project layout

```
src/core/            framework-free domain logic (unit-tested)
  transit/           model, dataset normalization, fares, service windows, time, Metro Cebu scope
  planner/           graph, live-conditions overlay, time-dependent Dijkstra
  sensing/           reports, policy, reputation, event derivation, effects, traces
  hazards/           official sources, interpretation, Open-Meteo rainfall (PAGASA levels)
  evaluation/        metrics, statistics (Wilson, McNemar, Wilcoxon), decision rules, CSV, replay scenarios
  snapshot.ts        API contract for live conditions
src/server/          JSON and Postgres stores, identity, access control, weather, services behind the API
src/auth.ts          Auth.js (Google) configuration
src/app/api/         route handlers (conditions, reports, me, traces, hazards, lab, auth)
src/app/             pages: plan, alerts, report, routes, privacy, lab, map
src/components/      UI grouped by feature
src/data/            the curated dataset (authoring format in schema.ts)
prisma/              schema and migrations (PostgreSQL)
scripts/             data validation, generators, JSON → Postgres import
```

## Contributing data

The dataset lives in plain TypeScript under [`src/data/`](src/data/), in the record format defined in [`schema.ts`](src/data/schema.ts).

1. Add stops to `src/data/stops.ts` with real coordinates and the correct `municipality` and `type`.
2. Add the route to `src/data/routes.ts`: ordered stops, fare (`per_km` with optional `base_km`, or `flat`), end-to-end duration, headway, and first/last trips. Set `direction: "one_way"` when each direction has its own record. Add `departures` only when a published timetable exists, because informal services are modeled by headway, never by invented timetables. Set `headway_evidence: "estimate"` when the headway is not confirmed.
3. Add walking or cross-town links to `src/data/transfers.ts`. Nearby stops of different routes (≤ 250 m) are linked automatically.
4. Set `verified_date` to the date you confirmed the data, then run `npm run validate`.

### The generated jeepney network

`src/data/experimental/cebu-city-jeepneys.ts` holds raw route descriptions scraped from cebujeepneys.weebly.com. `npx tsx scripts/build-jeepney-data.ts` geocodes them through OSM Nominatim (cached in `scripts/.geocode-cache.json`) and writes `src/data/generated/`. These routes are flagged **unverified** throughout the UI. To promote one, ride it, fix its stops and fare, move it into `src/data/routes.ts`, and remove the raw entry.
