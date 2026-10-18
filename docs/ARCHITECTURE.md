# Architecture

This document traces the research objectives in Chapter 1 of the manuscript to the code that implements them. It also records the design rules that Chapter 2 motivates. Policy numbers live in one file, [`src/core/sensing/policy.ts`](../src/core/sensing/policy.ts). They are **design inputs under evaluation**, not calibrated values.

## Layers

```
┌──────────────────────── client (static pages, PWA) ────────────────────────┐
│ search · plan · report · alerts · routes · privacy · lab                    │
│ ConditionsProvider ── polls GET /api/conditions every 60 s while visible    │
│ planner runs in the browser: baseline plan + live plan + "usual route today"│
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │ JSON (ConditionsSnapshot, reports, traces)
┌──────────────────────────────────▼──────────────────────────────────────────┐
│ src/app/api/*  route handlers   →  src/server/*  services + JSON store      │
│ reports → evidence → reputation → events → graph effects → snapshot         │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │ pure functions
┌──────────────────────────────────▼──────────────────────────────────────────┐
│ src/core/*  transit · planner · sensing · hazards · evaluation  (unit tests)│
└─────────────────────────────────────────────────────────────────────────────┘
```

`src/core` has no framework or I/O dependencies. The server and the browser run the same code: the server derives events, and the browser plans trips.

## Objective 1 — curated dataset and graph-based planner

| Concern | Where |
|---|---|
| Authoring format (stops, ordered route stops, fares, hours, headways, optional timetables) | `src/data/schema.ts`, `src/data/*.ts` |
| Normalization: day types, headways parsed from labels, LTFRB PUJ base-km fares, direction, generated walking links | `src/core/transit/normalize.ts` |
| Indexed dataset access | `src/core/transit/catalog.ts` |
| Directed multigraph (one-way records never reversed; parallel edges per route) | `src/core/planner/graph.ts` |
| Waits from service windows (half a headway inside a window; until the window opens otherwise) or from timetables | `src/core/transit/service.ts` |
| Time-dependent Dijkstra over (stop, boarded-route) states, one fare per vehicle, explicit feasibility rules | `src/core/planner/search.ts` |

The feasibility rules are written into the search, not hidden in a combined score:

- no two walking links in a row
- no walking off a vehicle only to re-board it
- at most 20 minutes of generated walking
- an optional limit on the number of rides
- in "cheapest" mode, an arrival bound relative to the fastest trip

A 3-minute transfer friction exists only inside the search and never appears in reported times.

GTFS separates exact timetables from frequency-based service. Informal services are therefore modeled with headway windows, and the dataset records how each headway was established (`published`, `observed`, or `estimate`). Ferries are currently marked `estimate`.

## Objective 2 — participatory sensing subsystem

| Concern | Where |
|---|---|
| Report interface (≤ 4 decisions, prefilled from the current trip, withdrawable) | `src/components/report/ReportFlow.tsx` |
| Report API, validation, rate limit, location → distance-to-stop reduction | `src/app/api/reports`, `src/server/reports.ts` |
| Pseudonymous identifiers (salted hash of a random device ID; no accounts) | `src/server/http.ts`, `src/lib/api.ts` |
| Consent (location on reports; ride traces) and retention controls | `src/hooks/useConsent.ts`, `src/components/privacy/PrivacyCenter.tsx`, `src/server/store.ts` |
| GPS traces → stop-to-stop segments **on the device**, re-checked on the server, published only as medians | `src/core/sensing/traces.ts`, `src/components/providers/RideTrackerProvider.tsx`, `src/server/traces.ts` |
| Hazard sources and their connection status | `src/core/hazards/sources.ts` |
| Spatial and temporal interpretation of official records | `src/core/hazards/interpret.ts` |

Retention: reports and labels are kept for 90 days, and ride segments for 30 days. Raw GPS fixes are never sent to the server. Shared coordinates are reduced to a distance from the stop in 10 m steps and are not stored.

Official records keep three kinds apart: **static hazard context**, **timestamped sensor readings**, and **active advisories**. Only a sensor reading at or above its threshold becomes flooding evidence at stops inside its stated radius. Advisories and susceptibility maps are shown as context. No live feed is claimed until access is confirmed. Manually entered records are always labeled "manual" and count for less.

## Objective 3 — confidence-weighted, time-decayed scoring

Implemented in `src/core/sensing/events.ts` and `effects.ts`. The steps:

1. **Matching.** Evidence is clustered by category, stop, and service (for delays and full vehicles), then by time within the category's match window. Delays on different services are never merged.
2. **Deduplication.** Each independent source keeps only its latest support item and its latest clearance. One pseudonym never counts twice, and a source's own later clearance retracts its earlier observation.
3. **Weighting.** Each item's weight is `credibility × kind weight × site factor × decay(age)`.
   - Credibility is the contributor's beta reputation, or the official source credibility.
   - Confirmations weigh 0.6, observations 1.
   - The site factor reflects whether the reporter was on site, location was unknown, or they were far away.
   - Decay is exponential with a category-specific half-life and a hard maximum age.
4. **Combination.** Weights combine by noisy-OR, `support = 1 − Π(1 − wᵢ)`, so volume and source diversity both raise confidence without it exceeding 1. Clearances combine the same way into `counter`, and `confidence = support × (1 − counter)`.
5. **Tiers.**
   - *pending* (< 0.45): not published.
   - *uncertain* (≥ 0.45): a notice plus a reduced effect.
   - *corroborated* (≥ 0.6): the full effect.
   - *cleared*: clearance evidence ≥ 0.6 and greater than support.
   - *expired*.
6. **Blocking.** A segment is disabled only for impassable flooding or a closed road with confidence ≥ 0.8 **and** at least two independent sources. A blocking event persists past its decay until a clearance arrives, capped at 24 h without new evidence, so a confirmed closure is not erased by a generic timer.
7. **Publication time** is the first report arrival at which the event crossed the publication threshold. It is computed by replaying arrivals in order.

Effects stay proportionate and keep distinct meanings (`ConditionEffect` in `src/core/planner/conditions.ts`):

| Event | Graph operation |
|---|---|
| Delay | Adds the reported minutes (half when uncertain) to that service's hops leaving the stop |
| Full vehicle | Adds about one headway (half when uncertain) of wait to boarding that service at that stop. The route is never disabled. |
| Flooding | Slows road and foot edges at the stop (×1.15 to ×2). Closes them when blocking. |
| Road disruption | Adds 5–20 minutes to road hops leaving the stop. Closes road edges when blocking. |
| Aggregated travel times | Replace the baseline hop time with the observed median |

Contributor reputation follows the beta reputation system, `(r + 1) / (r + s + 2)`, with older labels forgotten over a 90-day half-life. Reputation changes **only** from independently justified labels: field observation, official record, or controlled scenario. Agreement between contributors feeds event confidence, never reputation, so the evaluation is not circular. A new contributor starts at 0.5 and is not assumed unreliable.

## Objective 4 — evaluation support

| Metric | Where |
|---|---|
| (a) Estimate error: field validation rides store the observed minutes plus the baseline and enriched estimates for the same departure (Cebu time). MAE and MAPE are reported by condition. | `src/server/lab.ts` (`addValidation`), `src/core/evaluation/metrics.ts` |
| (b) Propagation time: publication time minus first report arrival. Clients refresh every 60 s. | `propagationStats` |
| (c) Verification precision and recall, counting false admissions and false rejections against labels | `verificationMetrics` |
| Controlled event replay, clearly tagged and removable | `src/core/evaluation/scenarios.ts`, `/lab` |

Usability (SUS) and adoption (adapted UTAUT) are measured with instruments outside the app. The app supports them by separating route guidance from contribution, so a participant can use the planner without reporting or sharing location.

## API

| Method & path | Purpose |
|---|---|
| `GET /api/conditions[?at=ISO]` | Published events, graph effects, travel-time aggregates, hazard status |
| `POST /api/reports` | Submit a report (header `x-komyut-device`) |
| `DELETE /api/reports/:id` | Withdraw your report |
| `GET` / `DELETE /api/me` | Your contributions and reputation / erase them all |
| `POST /api/traces` | Device-derived ride segments (explicit consent flag required) |
| `GET /api/hazards` | Hazard sources and active official notices |
| `GET /api/lab`, `POST /api/lab/{scenarios,labels,official,validations}`, `DELETE /api/lab/scenarios` | Research console. Gated by `KOMYUT_LAB_KEY` when set. |

## Known limitations

- **Persistence.** The JSON file store fits a single-process pilot. A shared deployment needs a database, and authentication is still to come.
- **Spatial matching.** Events match at the stop level. The graph has no road geometry, so a closure affects edges at that stop, not parallel routes through nearby stops.
- **Distances.** Hop distances and fares use great-circle distance between consecutive stops.
- **Hazard feeds.** No live feed is connected. Access terms, Cebu coverage, and timestamp meaning must be confirmed first.
