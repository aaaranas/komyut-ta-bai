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
│ src/app/api/*  route handlers   →  src/server/*  services + store         │
│ store: PostgreSQL via Prisma (DATABASE_URL) or JSON file (local dev)       │
│ identity: Google sign-in (Auth.js) → salted pseudonym + random nickname    │
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
| Sign-in and pseudonymous identity: Google sign-in links the account to a salted pseudonym and a random nickname; only hashes of the Google subject and email are stored, apart from report content. Without Google credentials, "dev mode" uses a salted hash of a random device ID | `src/auth.ts`, `src/server/identity.ts`, `src/server/access.ts`, `src/components/auth/Identity.tsx` |
| Study area: Metro Cebu (13 LGUs). Out-of-scope records are kept but flagged; provincial routes are routed only on their Metro Cebu segments | `src/core/transit/scope.ts`, `src/core/planner/index.ts` |
| Screen Wake Lock while a consented ride trace runs (no background tracking) | `src/hooks/useScreenWakeLock.ts` |
| Consent (location on reports; ride traces) and retention controls | `src/hooks/useConsent.ts`, `src/components/privacy/PrivacyCenter.tsx`, `src/server/store.ts` |
| GPS traces → stop-to-stop segments **on the device**, re-checked on the server, published only as medians | `src/core/sensing/traces.ts`, `src/components/providers/RideTrackerProvider.tsx`, `src/server/traces.ts` |
| Hazard sources and their connection status (PhilSensors stub behind `KOMYUT_ENABLE_PHILSENSORS`) | `src/core/hazards/sources.ts`, `src/server/hazards/philsensors.ts` |
| Open-Meteo rainfall forecast, PAGASA warning levels, 15-min cache, "unavailable" on failure | `src/core/hazards/rainfall.ts`, `src/server/weather.ts` |
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
5. **Tiers, with hysteresis.**
   - *pending*: never reached θ_pub = 0.45; not published.
   - *uncertain*: published (≥ θ_pub on arrival, and still ≥ θ_exp = 0.30).
   - *corroborated* (≥ 0.6).
   - A published event *expires* only below θ_exp, so an event near θ_pub doesn't flicker.
   - *cleared*: clearance evidence ≥ 0.6 and greater than support.
   - *expired*.
6. **Blocking.** A segment is disabled only for impassable flooding or a closed road with confidence ≥ 0.8 **and** at least two independent sources. A blocking event persists past its decay until a clearance arrives, capped at 24 h without new evidence, so a confirmed closure is not erased by a generic timer.
7. **Publication time** is the first report arrival at which the event crossed the publication threshold. It is computed by replaying arrivals in order.

Effects scale with confidence C and keep distinct meanings (`ConditionEffect` in `src/core/planner/conditions.ts`). Area conditions follow **w(e) = w₀(e) · (1 + αₖ · C)**, so weights never fall below baseline and Dijkstra stays valid; **w(e) = ∞** (a closure) only for a blocking event:

| Event | Graph operation |
|---|---|
| Delay | Adds C × the reported minutes to that service's hops leaving the stop |
| Full vehicle | Adds C × about one headway of wait to boarding that service at that stop. The route is never disabled. |
| Flooding | Road and foot edges at the stop: α = 0.3 (passable) or 1.0 (impassable). Closed when blocking. |
| Road disruption | Road hops leaving the stop: α = 1.5 (slow) or 3.0 (closed). Closed when blocking. |
| Rainfall forecast (Open-Meteo) | Road and foot edges near the sample point: × (1 + α), α = 0.05 / 0.10 / 0.15 for PAGASA yellow / orange / red. **Never a closure.** |
| Aggregated travel times | Replace the baseline hop time with the observed median |

Contributor reputation follows the beta reputation system, `(r + 1) / (r + s + 2)`, with older labels forgotten over a 90-day half-life. Reputation changes **only** from independently justified labels: field observation, official record, or controlled scenario. Agreement between contributors feeds event confidence, never reputation, so the evaluation is not circular. A new contributor starts at 0.5 and is not assumed unreliable.

## Objective 4 — evaluation support

| Metric | Where |
|---|---|
| (a) Estimate error: field rides store the observed minutes plus the baseline and enriched estimates for the same departure (Cebu time). MAE and MAPE by condition, and a **Wilcoxon signed-rank test** on paired absolute errors | `src/server/lab.ts` (`addValidation`), `src/core/evaluation/metrics.ts`, `stats.ts` |
| (b) Propagation time: from the earlier of report receipt or feed observation to the **first route response** (the first `/api/conditions` snapshot carrying the event), both server timestamps; median and p90. Replays are excluded | `propagationStats`, `markRouteResponses` in `src/server/sensing.ts` |
| (c) Precision, recall, false admission and false rejection rates with **95% Wilson intervals**, for the confidence rule and a **count-only rule** (publish once two accounts agree), compared with **McNemar's test** on the reports where they disagree | `src/core/evaluation/rules.ts`, `compareRules`, `stats.ts` |
| Development / test sets: every label belongs to one; a report (and the other reports of its event) can't move between them | `setLabel` in `src/server/lab.ts` |
| CSV export: field rides, decisions under both rules, propagation | `GET /api/lab/export?kind=…` |
| Controlled event replay, clearly tagged and removable | `src/core/evaluation/scenarios.ts`, `/lab` |

Usability (SUS) and adoption (adapted UTAUT) are measured with instruments outside the app. The app supports them by separating route guidance from contribution, so a participant can use the planner without signing in, reporting, or sharing location.

## Differences from the manuscript formulas

These are deliberate and defensible; each is a design input under evaluation.

- **Confidence** adds two multipliers to each term, `Rᵢ · kᵢ · sᵢ · e^(−Δtᵢ/τₖ)`: a kind weight kᵢ (confirmation 0.6, observation 1) and a site factor sᵢ (on site 1, location unknown 0.85, far 0.6). Decay is configured as a half-life hₖ, so τₖ = hₖ / ln 2, and evidence older than a category maximum age counts as zero.
- **Forgetting** in the beta reputation weights each label by `0.5^(age / 90 days)` instead of multiplying the counts by λ at every update. In continuous time this is the same exponential forgetting, and it doesn't depend on how often labels arrive.
- **Count-only rule** counts distinct sources in the same cluster the confidence rule uses (same category, stop, service, and match window), so the comparison isolates the decision function.
- **Delays and full vehicles** scale additively (C × minutes) rather than multiplicatively, because a reported delay is a time offset, not a speed ratio.

## API

| Method & path | Purpose |
|---|---|
| `GET /api/conditions[?at=ISO]` | Published events, graph effects, travel-time aggregates, hazard status, rainfall forecast (live only) |
| `POST /api/reports` | Submit, confirm, or clear (signed in; dev mode: header `x-komyut-device`) |
| `DELETE /api/reports/:id` | Withdraw your report |
| `GET` / `DELETE /api/me` | Your contributions and reputation / erase them all, including the linked account |
| `GET /api/me/identity` | Sign-in mode, signed-in state, nickname |
| `POST /api/traces` | Device-derived ride segments (explicit consent flag required) |
| `GET /api/hazards` | Hazard sources, active official notices, rainfall forecast |
| `/api/auth/*` | Auth.js (Google) |
| `GET /api/lab`, `POST /api/lab/{scenarios,labels,official,validations,demo}`, `DELETE /api/lab/{scenarios,demo}`, `GET /api/lab/export` | Research console. Researcher allowlist when sign-in is on; `KOMYUT_LAB_KEY` otherwise. |

## Known limitations

- **Persistence.** The Postgres store loads the whole working set per request and serializes writes with an advisory lock. That fits a pilot of thousands of reports, not a city-wide service.
- **Spatial matching.** Events match at the stop level. The graph has no road geometry, so a closure affects edges at that stop, not parallel routes through nearby stops.
- **Distances.** Hop distances and fares use great-circle distance between consecutive stops. Flat fares on provincial routes stay as authored even when only their Metro Cebu part is ridden.
- **Hazard feeds.** No government live feed is connected. Access terms, Cebu coverage, and timestamp meaning must be confirmed first. Open-Meteo is a model forecast and is never treated as an observation.
- **Location while riding.** A web app only gets location while it is open; the Wake Lock keeps the screen on but there is no background tracking.
