@AGENTS.md

# Komyut ta Bai — working notes

Thesis prototype: multimodal trip planner for **Metro Cebu** with participatory sensing. See `README.md` for features and setup, and `docs/ARCHITECTURE.md` for how each research objective maps to code and where the code deliberately differs from the manuscript formulas.

## Conventions

- `src/core/` is framework-free, pure, and unit-tested (`node:test` via `npm test`). Every formula needs a test with a hand-calculated expected value.
- Persistence, identity, and network calls live in `src/server/`; route handlers in `src/app/api/` stay thin.
- Policy numbers (thresholds θ_pub/θ_exp/θ_block, αₖ, decay, travel-time support) live only in `src/core/sensing/policy.ts`. Rainfall thresholds live in `src/core/hazards/rainfall.ts`.
- Never invent data: fares, routes, stops, and schedules come only from `src/data/`. Out-of-scope records are flagged by `src/core/transit/scope.ts`, never deleted.
- A forecast (Open-Meteo) must never close an edge; only verified reports or official observations can. Manual official records are labeled "official (manual)", never "live".
- Before calling a phase done, run: `npm test`, `npm run typecheck`, `npm run lint`, `npm run validate`, `npm run build`.

## Stores and identity

- `DATABASE_URL` set → PostgreSQL via Prisma 7 (`src/server/postgres-store.ts`); otherwise the JSON file store. Both implement `Store` in `src/server/store.ts` and pass the same contract test (`TEST_DATABASE_URL` enables the Postgres run). Adding a table means updating `Database`, `emptyDatabase`, `prisma/schema.prisma`, a new migration, and `TABLES` in the Postgres store.
- Never run `prisma migrate` against a real (non-disposable) database without asking the user.
- Google sign-in is on only when `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, and `AUTH_SECRET` are set; otherwise dev mode. Use `requireContributor` / `requireLabAccess` from `src/server/access.ts` in route handlers.
