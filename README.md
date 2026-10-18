# Komyut ta Bai 🚌⛴️

**Asa ta, Bai?** — A multimodal transit planner for Cebu with a participatory sensing layer.

Komyut ta Bai plans trips across MyBus, jeepneys (PUJ), V-hires, provincial buses, and ferries using a curated dataset and a graph-based planner. Commuters report **delays, flooding, full vehicles, and road disruptions**. Those reports go through a verification layer, and a confidence-weighted, time-decayed score turns them into changes to the route graph. Every plan shows the baseline estimate next to the live-adjusted one.

It is the software artifact for the CMSC 198.1 thesis *“Komyut ta Bai: A Participatory Sensing Framework for Real-Time Transit Data Enrichment in Cebu’s Informal Public Transportation Network”* (UP Cebu). See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for how each research objective maps to code.

> Authentication is intentionally not implemented yet. Contributors are identified only by a salted pseudonym of a random per-device ID.

## Features

- **Multimodal trip planning** — a time-dependent Dijkstra over a directed multigraph. It models service windows and headway-based waits, one fare per vehicle (LTFRB-style distance fares for PUJs), walking links between nearby stops, transfer limits, and fastest/cheapest modes.
- **Commuter reporting** — four categories, a few taps, prefilled from the trip you're on. You can withdraw a report at any time.
- **Verification layer** — beta reputation that changes only from independent labels, deduplication by pseudonym, confirmations weighted below observations, an on-site check from distance to the stop, and clearance reports.
- **Confidence-weighted, time-decayed scoring** — decay rates differ by category. Low-confidence events get only small adjustments, a segment is disabled only on strong evidence from multiple sources, and confirmed closures hold until someone reports them cleared.
- **Hazard information** — PAGASA, DOST-ASTI, and PHIVOLCS sources, each with its connection status stated. No live feed is claimed: sensor readings entered by hand are labeled "manual". Advisories are shown as context only.
- **Consent-based ride traces** — opt-in. Stop-to-stop times are computed on the phone, and raw GPS points never leave the device. Only medians are published, and only when at least 3 rides from at least 2 contributors back them.
- **Privacy center** — consent toggles, your pseudonym and reliability score, your reports, and "delete everything".
- **Research console** (`/lab`) — controlled replay scenarios, ground-truth labeling, field validation rides, and the Objective 4 metrics (estimate error, propagation time, verification precision and recall).

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router) + TypeScript + [Tailwind CSS 4](https://tailwindcss.com)
- [MapLibre GL](https://maplibre.org) with OpenStreetMap raster tiles
- [Serwist](https://serwist.pages.dev) service worker (installable on Android). Planning still works offline on the baseline dataset.
- Route handlers for the sensing API, with a JSON file store (prototype persistence)

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

| Variable | Purpose |
|---|---|
| `KOMYUT_DATA_DIR` | Where the report store lives (default `./.data`). On read-only hosts it falls back to the OS temp directory, and the UI says reports may reset. |
| `KOMYUT_PSEUDONYM_SALT` | Salt for hashing device IDs into pseudonyms. **Set this on any shared deployment.** |
| `KOMYUT_LAB_KEY` | When set, `/api/lab/*` requires this shared key. Use it until real authentication exists. |

## Project layout

```
src/core/            framework-free domain logic (unit-tested)
  transit/           model, dataset normalization, fares, service windows, time
  planner/           graph, live-conditions overlay, time-dependent Dijkstra
  sensing/           reports, policy, reputation, event derivation, effects, traces
  hazards/           official sources, spatial/temporal interpretation
  evaluation/        metrics and controlled replay scenarios
  snapshot.ts        API contract for live conditions
src/server/          persistence, pseudonyms, services behind the API
src/app/api/         route handlers (conditions, reports, me, traces, hazards, lab)
src/app/             pages: plan, alerts, report, routes, privacy, lab, map
src/components/      UI grouped by feature
src/data/            the curated dataset (authoring format in schema.ts)
scripts/             data validation and generators
```

## Contributing data

The dataset lives in plain TypeScript under [`src/data/`](src/data/), in the record format defined in [`schema.ts`](src/data/schema.ts).

1. Add stops to `src/data/stops.ts` with real coordinates and the correct `municipality` and `type`.
2. Add the route to `src/data/routes.ts`: ordered stops, fare (`per_km` with optional `base_km`, or `flat`), end-to-end duration, headway, and first/last trips. Set `direction: "one_way"` when each direction has its own record. Add `departures` only when a published timetable exists, because informal services are modeled by headway, never by invented timetables. Set `headway_evidence: "estimate"` when the headway is not confirmed.
3. Add walking or cross-town links to `src/data/transfers.ts`. Nearby stops of different routes (≤ 250 m) are linked automatically.
4. Set `verified_date` to the date you confirmed the data, then run `npm run validate`.

### The generated jeepney network

`src/data/experimental/cebu-city-jeepneys.ts` holds raw route descriptions scraped from cebujeepneys.weebly.com. `npx tsx scripts/build-jeepney-data.ts` geocodes them through OSM Nominatim (cached in `scripts/.geocode-cache.json`) and writes `src/data/generated/`. These routes are flagged **unverified** throughout the UI. To promote one, ride it, fix its stops and fare, move it into `src/data/routes.ts`, and remove the raw entry.
