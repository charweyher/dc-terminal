# DC Terminal

Public-data terminal for **US data centers**: operating vs planned counts, behind-the-meter / self-powered facilities, and water statistics where public sources allow — with honest coverage and confidence labels on every sensitive number.

Built with Next.js (App Router) + TypeScript + Tailwind + MapLibre GL. The full MVP (all routes, map, tables, credibility pages) is implemented; the repo also contains the spec docs and phased prompts it was built from.

**UX references:** [Cleanview US map](https://cleanview.co/data-centers/us) for layout clarity; Bloomberg-like density for chrome. Do **not** scrape Cleanview's database.

---

## Run it

```bash
npm install
npm run dev            # http://localhost:3000
```

Other scripts:

```bash
npm run validate:data  # schema checks on data/facilities.json — run after any data edit
npm run build          # production build (must pass before shipping/committing a phase)
npm run start          # serve the production build
npm run lint           # eslint
npm run ingest:overpass  # pull US data-center candidates from OpenStreetMap → data/raw/ staging
npm run ingest:eia       # (needs free EIA_API_KEY) BTM generator candidates → data/raw/ staging
```

Ingest scripts stage candidates for **human curation** — they never write `data/facilities.json` directly. See [`scripts/ingest/README.md`](scripts/ingest/README.md).

No API keys are required. The map uses CARTO's free "Dark Matter" basemap (style URL documented in `components/FacilityMap.tsx`) with a US-states layer (Census-derived GeoJSON in `public/us-states.geojson`) drawn on top: crisp state borders + code labels at national zoom, hover highlight, and click-through to `/states/[code]`. Attribution to © CARTO / © OpenStreetMap contributors is rendered by the map control and must stay visible. For high-traffic production use, plan to self-host tiles or license a provider.

## Routes

| Route | Purpose |
|-------|---------|
| `/` | KPI strip (with coverage sublines), map preview, largest operating/planned tables |
| `/learn` | Data Centers 101 — plain-language primer: what/why, benefits, impacts, key terms |
| `/map` | Full map + status / BTM / water / state filters |
| `/facilities` | Dense sortable, searchable, filterable table |
| `/facilities/[id]` | Full record with per-field confidence badges + sources |
| `/states/[code]` | State rollups (invalid USPS codes → 404) |
| `/behind-the-meter` | BTM explainer, single evidence-labeled ranked list, coverage |
| `/water` | Known-water facilities, coverage, labeled external estimates |
| `/methodology` | Confidence model, pipeline, source registry, non-completeness disclaimer |

## Code map

```text
app/                    Routes (App Router, server components load data)
components/             Terminal UI: Panel, KpiCell, FacilityMap, FacilityTable,
                        MapExplorer, ConfidenceBadge, ConfidentField, FilterSelect…
lib/
  types.ts              Schema types (mirror docs/DATA_SCHEMA.md)
  data.ts               Cached fs loaders for data/*.json (server-side)
  kpis.ts               computeKpis — all headline numbers derive from here
  mapPoints.ts          Facility → map point flattening
  tableRows.ts          Facility → table row flattening
  useFacilityFilters.ts Shared client filter hook (map + table)
  states.ts             USPS codes + names
scripts/validate-data.mjs  Schema validator (npm run validate:data)
data/                   Versioned inventory + sources + water context
docs/                   Product spec, schema, sources, pipeline, design system
prompts/                The phased Claude Code prompts this app was built from
```

---

## Continuing with Claude Code

Open this directory as the project root; Claude reads `CLAUDE.md` automatically. The six build phases in `prompts/` are **all complete**. For further work:

- Paste a follow-up task directly, or write a new prompt file in `prompts/` following the same style.
- Keep the hard rules in `CLAUDE.md` (no scraping proprietary inventories, no invented numbers, coverage disclosure on every KPI).
- After any change: `npm run validate:data && npm run build` must pass.

Phase history: [`docs/BUILD_PHASES.md`](docs/BUILD_PHASES.md) · prompts in [`prompts/`](prompts/).

---

## Adding a facility

1. Follow [`docs/DATA_PIPELINE.md`](docs/DATA_PIPELINE.md) and use only sources allowed by [`docs/DATA_SOURCES.md`](docs/DATA_SOURCES.md).
2. Register new sources in `data/sources.json`.
3. Append the facility to `data/facilities.json` per [`docs/DATA_SCHEMA.md`](docs/DATA_SCHEMA.md) — wrap capacity, BTM, water, and coordinates in the confidence model; unknown means `null` + `"unknown"`.
4. `npm run validate:data` (unique ids, USPS states, coordinate bounds, unknown⇒null, source references).
5. Append to `CHANGELOG_DATA.md` and bump `data/meta.json`.
6. Smoke-check the KPI strip and map.

All data lives in the curated `data/facilities.json` — every row is real and sourced (no sample/fixture data).

---

## Dataset scope disclaimer

Figures reflect this repo's public curated inventory, **not** a complete national census — commercial trackers list far more projects, and the UI says so wherever totals appear. Sample rows include clearly labeled illustrative/synthetic entries for UI testing (see facility `notes`); replace or remove them before publishing analytics. Respect upstream licenses when citing government, corporate, and academic sources.
