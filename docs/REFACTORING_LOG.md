# Refactoring Log

Full-codebase review against [refactoring.guru](https://refactoring.guru) code smells, applied 2026-06-13. Verified at each step with `npx tsc --noEmit`, `npm run validate`, and `npm run lint`; final verification with a production build and page checks.

## New structure

```
src/lib/types.ts        types only (unchanged role)
src/lib/constants.ts    NEW — mode config, map config, Cebu bounds, storage keys
src/lib/catalog.ts      NEW — data-access facade (merging + indexed lookups)
src/lib/utils/          NEW — geo.ts, fare.ts, time.ts (pure functions, one domain each)
src/lib/planner/        NEW — graph.ts, dijkstra.ts, index.ts (facade)
src/data/               raw data arrays only, no logic
src/components/         focused UI components, all under 150 lines
src/components/plan/    journey-results pieces
src/components/routes/  route-browser/detail pieces
src/app/                slim pages that compose components
```

## Refactorings applied

### Bloaters

| Smell | Technique | File(s) |
|---|---|---|
| Long Method — `planJourney` was ~120 lines doing search, backtrack, merge, and rounding | Extract Function: `runSearch`, `tracePath`, `mergeHopsIntoLegs`, `roundLegsForDisplay`, `edgeBoardingFee`, `visitCost`, `popCheapest` | `src/lib/planner/dijkstra.ts` (was `src/lib/planner.ts`) |
| Long Method — `buildGraph` mixed route-edge and transfer-edge construction | Extract Function: `addRouteEdges`, `addTransferEdges`, `hopDistancesKm`, `addEdge` | `src/lib/planner/graph.ts` (was `src/lib/graph.ts`) |
| Large Component — `PlanResults` (~230 lines) rendered toggle, summary, timeline, and empty states | Extract Component: `LegRow`, `JourneySummaryCard`, `PreferenceToggle`, `NoRouteFound` | `src/app/plan/PlanResults.tsx` → `src/components/plan/*` |
| Large Component — `RouteBrowser` (~190 lines) rendered filters, cards, and notices | Extract Component: `ModeFilterPills`, `RouteCard`, `UnverifiedBadge`; local `UnverifiedDataNotice` | `src/app/routes/RouteBrowser.tsx` → `src/components/routes/*` |
| Large Component — route detail page rendered facts grid and stop timeline inline | Extract Component: `RouteFactsGrid` (with `Fact` subcomponent), `StopSequenceList`, `UnverifiedSourceNotice` | `src/app/routes/[id]/page.tsx` → `src/components/routes/*` |
| Long Method — `MapView`'s `useEffect` body (~50 lines) | Extract Function: `createMap`, `addStopMarkers`, `addRouteLine`, `fitMapToStops` | `src/components/MapView.tsx` |
| Data Clumps — fare components and route metadata already grouped | Kept `Fare` union and `Route` interface as the parameter objects throughout (no raw `(base, perKm)` parameter pairs) | `src/lib/types.ts` |
| Primitive Obsession — already addressed | Modes, stop types, and preference are literal unions (`Mode`, `StopType`, `Preference`); experimental status is the literal `"unverified"` | `src/lib/types.ts` |

### Object-Orientation Abusers

| Smell | Technique | File(s) |
|---|---|---|
| Switch Statements around mode presentation | Strategy record: `MODE_CONFIG: Record<Mode \| "transfer", ModeConfig>` is the single mode-dispatch point; no mode `switch`/`if-else` exists anywhere | `src/lib/constants.ts` (was `src/lib/modes.ts`) |

### Change Preventers

| Smell | Technique | File(s) |
|---|---|---|
| Parallel Inheritance — adding a transport mode previously meant touching badge markup in 3 components | Centralized all presentation in `MODE_CONFIG`; components read `label`/`icon`/`badge`/`dot`/`hex` from it. A new mode = 1 entry here + 1 union member in `types.ts` | `src/lib/constants.ts`, all components |
| Shotgun Surgery — `stopsById`/`routesById` maps were built in data files and imported ad hoc | Consolidated all dataset access (merging curated + generated, lookups, ordered-stop resolution) into the catalog | `src/lib/catalog.ts` |
| Divergent Change — `modes.ts` held both mode config and formatting helpers | Split: config → `constants.ts`; `formatFare`/`describeFare` → `utils/fare.ts`; `formatDuration` → `utils/time.ts` | `src/lib/utils/*` |

### Dispensables

| Smell | Technique | File(s) |
|---|---|---|
| Duplicate Code — `fareLabel` was defined in both the route browser and the route detail page | Extract Function → `describeFare` | `src/lib/utils/fare.ts` |
| Duplicate Code — stop ordering (`sort by sequence → resolve → filter`) repeated in graph builder and detail page | Extract Function → `orderedStopsOf(route)` | `src/lib/catalog.ts` |
| Dead Code — unused create-next-app assets | Deleted `public/{file,globe,next,vercel,window}.svg` | `public/` |
| Dead Code — raw-text experimental section in the browser superseded by real generated routes | Deleted section; raw file retained solely as generator input | `src/app/routes/RouteBrowser.tsx` |
| Unnecessary Comments — comments restating code (`// stale entry`, swap/submit explanations) | Replaced with intention-revealing names (`continuesSameVehicle`, `boardsNewVehicle`, `wasDismissed`, `handleSearch`, `handleSwap`) | planner, form components |

### Couplers

| Smell | Technique | File(s) |
|---|---|---|
| Inappropriate Intimacy — components imported raw data modules and probed `Map`s directly | Hide Delegate: components call `getStop`/`getRoute`/`hasStop`/`orderedStopsOf` instead of touching `stopsById.get(...)` | `src/lib/catalog.ts`, all consumers |
| Feature Envy — `boardingFare` lived in the graph module but operates purely on `Route` fare data | Move Function → `utils/fare.ts` | `src/lib/utils/fare.ts` |
| Message Chains — `graph.get(stopId) ?? []` repeated in the search loop | Helper accessor `edgesFrom(stopId)` | `src/lib/planner/graph.ts` |

### Specific techniques

| Technique | Instances |
|---|---|
| Extract Function (inline JSX handlers >3 lines) | `StopCombobox`: `handleInputChange`, `handleFocus`, `handleBlur`, `handleSelect`, `matchStops`; `JourneySearchForm`: `handleSearch`, `handleSwap`; `InstallPrompt`: `useDeferredInstallPrompt` hook with `accept`/`dismiss` |
| Rename Variable/Function | `from/to` → `origin/destination`; `pref` → `preference`; `meta` → `config`; `q` → `needle`; `e` → `event`; `keyOf` → `stateKey`; `EPSILON` → `SECONDARY_WEIGHT`; `MODE_META` → `MODE_CONFIG`; `R` → `EARTH_RADIUS_KM`; `toRad` → `toRadians` |
| Replace Magic Numbers | `EARTH_RADIUS_KM`, `MAP_DEFAULT_CENTER`, `MAP_DEFAULT_ZOOM`, `OSM_TILE_URL`, `OSM_ATTRIBUTION`, `INSTALL_PROMPT_DISMISS_KEY`, `SECONDARY_WEIGHT`, `CEBU_BOUNDS` (transfer/fare numbers like 40 min CSBT↔CNBT are *data*, so they live in `src/data/transfers.ts`, not constants) |
| Introduce Explaining Variable | `boardsNewVehicle`, `continuesSameVehicle`, `wasDismissed`, `hasJourney`, `unverifiedCount` |
| Replace Nested Conditional with Guard Clauses | `planJourney` (invalid stops / same stop early returns), `addRouteLine`/`fitMapToStops` (empty-input returns), `edgeBoardingFee` |
| Separate Query from Modifier | Dijkstra search (`runSearch`, query) separated from leg assembly (`mergeHopsIntoLegs`) and display rounding (`roundLegsForDisplay`, the only mutator, clearly named) |
| Facade | `src/lib/planner/index.ts` exposes `planJourney`; `src/lib/catalog.ts` fronts the data layer (merge + lookups) |
| Strategy | `MODE_CONFIG` record keyed by mode for all mode-specific presentation |
| Observer | `OfflineIndicator` already used `useSyncExternalStore` over online/offline events — kept as the clean event-driven pattern |
| Adapter | `scripts/build-jeepney-data.ts` is the adapter from the scraped external format to internal `Stop`/`Route` types; conversion stays isolated in the script, never at runtime |

## Deliberately not changed

- **`validate-data.ts` checks experimental data separately** — different shape, lighter rules; merging the checks would couple unrelated validations.
- **Array-scan priority queue in Dijkstra** — a binary heap would be Speculative Generality at this graph size (<1k edges); the scan is simpler and measured-fast.
- **`src/data/experimental/cebu-city-jeepneys.ts` retained** — it is the regeneration source for the generated network, not dead code.
