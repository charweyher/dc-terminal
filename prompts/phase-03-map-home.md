# Phase 3 — Map + Home

Read first: `CLAUDE.md`, `docs/DESIGN_SYSTEM.md`, `docs/PRODUCT_SPEC.md` (home + map sections).

## Objective

Ship the interactive MapLibre map and a real terminal home page: live KPIs, map, largest operating/planned tables.

## Tasks

1. Add `maplibre-gl` (+ React wrapper if useful, e.g. `react-map-gl` with maplibre, or a client component wrapping MapLibre).
2. Use a **free dark basemap** (no paid Mapbox token required for MVP). Document the tile/style URL in a short code comment or README note.
3. Build `<FacilityMap>` client component:
   - Markers/circles from facility lat/lng where values exist  
   - Color by status; optional green ring for BTM `true`  
   - Size by MW when known  
   - Popup or click → facility name + link to detail route (detail may still be thin until Phase 4)
4. Implement `/map` with filter controls: status, BTM, water-known, state (filters can be client-side on loaded JSON).
5. Flesh out `/`:
   - KPI strip from `computeKpis`  
   - Embedded map preview  
   - Tables: top operating / top planned by known `it_load_mw`  
6. Respect location precision: still plot city-level points; title tooltip can note precision.
7. Skip facilities with null coordinates in the map layer; show a small “N unmapped” note.
8. `npm run build` passes; map loads in browser.

## Acceptance criteria

- [ ] Map shows sample facilities across multiple states  
- [ ] Operating vs planned colors match design system  
- [ ] Home KPIs + tables are data-driven  
- [ ] No API key required for basic local dev  

## Do not

- Implement full facilities table page (Phase 4) beyond links  
- Add paid map dependencies as required  

When finished, note any map style attribution requirements.
