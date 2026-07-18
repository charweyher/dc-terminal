# Phase 2 — Data Layer

Read first: `CLAUDE.md`, `docs/DATA_SCHEMA.md`, `docs/DATA_PIPELINE.md`, `docs/DATA_SOURCES.md`.

## Objective

Wire typed facility data, validation, and KPI aggregation from `data/facilities.sample.json` (and `data/facilities.json` if you create it as a copy).

## Tasks

1. Implement TypeScript types matching `docs/DATA_SCHEMA.md` in e.g. `src/lib/types.ts`.
2. Load `data/sources.json` and facility dataset via typed loaders (`src/lib/data.ts`). Prefer reading JSON from `data/`; if bundling requires import assertions or `fs` in server components, use the pattern appropriate for Next.js App Router (server-side).
3. Create `data/facilities.json` as a copy of the sample for the app’s default inventory (keep sample as fixture).
4. Implement `computeKpis(facilities): DatasetKpis` per schema.
5. Add `scripts/validate-data.mjs` enforcing schema rules; add `npm run validate:data`.
6. Add `data/meta.json` and initialize `CHANGELOG_DATA.md`.
7. Add `data/raw/README.md` explaining EIA download hygiene + gitignore for large raw files.
8. Update `.gitignore` for `data/raw/**/*.zip`, `*.xlsx` if not present.
9. Surface KPI values on the home placeholder strip (still no map). Use coverage sublines.
10. `npm run validate:data` and `npm run build` must pass.

## Acceptance criteria

- [ ] Types compile  
- [ ] KPIs match sample data when counted manually  
- [ ] Validator catches a deliberate bad id/source if you temporarily break one (fix after test)  
- [ ] No hardcoded fake national totals  

## Do not

- Build the map yet  
- Add unscored/unsourced facilities  
- Claim Cleanview-scale completeness in UI copy  

When finished, paste example KPI output from the sample dataset in your summary.
