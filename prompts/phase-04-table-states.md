# Phase 4 — Facilities Table, Detail, States

Read first: `docs/PRODUCT_SPEC.md` (facilities + states), `docs/DATA_SCHEMA.md`.

## Objective

Bloomberg-dense facilities browser, facility detail pages, and state rollups.

## Tasks

1. `/facilities` — dense filterable sortable table:
   - Columns: name, state, status, MW, BTM, water known?, type, operator  
   - Search by name/operator/developer  
   - Filters aligned with map filters  
2. `/facilities/[id]` — full record with confidence badges (`CONF`/`RPT`/`EST`/`UNK`) on capacity, BTM, water, coordinates; list sources with links from `sources.json`.
3. `/states/[code]` — rollups for that USPS code (counts, MW, BTM, water coverage) + facility list. Invalid codes → 404.
4. Wire map popups / home tables to detail routes.
5. Empty states: “No facilities match filters.”
6. `npm run build` passes.

## Acceptance criteria

- [ ] Every sample facility reachable by id  
- [ ] State pages work for states present in sample data  
- [ ] Confidence badges visible on detail  
- [ ] Table usable on desktop (dense); acceptable on mobile  

## Do not

- Build BTM/water/methodology deep pages yet (stubs OK if already present)  

When finished, list example URLs for one facility and one state.
