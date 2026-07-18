# Ingest scripts — live public data feeds

These scripts pull from **public, licensed APIs** and write *staging* files under
`data/raw/*.staging.json` (gitignored). They never touch `data/facilities.json`
directly — promotion into the curated inventory is a human step per
`docs/DATA_PIPELINE.md` (wrap fields in the confidence model, cite sources,
validate, changelog, version bump).

> **Why no Cleanview API?** Cleanview's facility inventory is their proprietary
> database. Reverse-engineering or replaying their private endpoints is
> forbidden by this repo's rules (`CLAUDE.md`) and their terms. We reproduce the
> *idea* from the same public wells they draw from instead.

| Script | Source | Key needed | Output |
|--------|--------|-----------|--------|
| `overpass-datacenters.mjs` | OpenStreetMap via Overpass API (`telecom=data_center`, `building=data_center` in the US) | No | `data/raw/overpass-datacenters.staging.json` |
| `eia-generators.mjs` | EIA Open Data API v2 — operating generator capacity (EIA-860M lineage), keyword-matched to data-center operators | Free key: `EIA_API_KEY` env var ([register](https://www.eia.gov/opendata/register.php)) | `data/raw/eia-btm-candidates.staging.json` |

## Run

```bash
npm run ingest:overpass          # no key required
npm run ingest:eia               # reads EIA_API_KEY from .env; or: -- --states TX,GA,TN
```

For the EIA key: `cp .env.example .env`, paste your key after `EIA_API_KEY=`.
`.env` is gitignored — never commit the key.

## Map candidate layer

`npm run build:candidates` (scripts/build-osm-candidates.mjs) converts the
Overpass staging file into `public/osm-candidates.geojson` — the dim
"OSM-reported (unverified)" toggle layer on `/map`. It filters to US points
(point-in-polygon vs `public/us-states.geojson`), drops candidates within
~1.5 km of curated rows, and writes `data/osm-candidates.meta.json` for the UI
count. Both outputs are committed (ODbL-attributed). Re-run it after
`ingest:overpass` or after promoting rows into `data/facilities.json`.
Candidates never feed KPIs — display only.

## Curation workflow

1. Run a script; open the staging JSON.
2. Cross-check each candidate against a second public source (permit, press
   release, corporate disclosure, EIA plant page).
3. Add/update the facility in `data/facilities.json` with proper
   `ConfidentValue` wrapping and `source_ids` (register new sources in
   `data/sources.json` — `osm-overpass-datacenters` covers OSM-derived
   coordinates; `eia-860-overview` covers EIA generator rows).
4. `npm run validate:data` → `CHANGELOG_DATA.md` entry → bump `data/meta.json`.

## Licensing

- **OSM/Overpass:** ODbL. Facility rows whose coordinates/names come from OSM
  must keep "© OpenStreetMap contributors" lineage (the source registry entry
  records this). Be gentle with the public Overpass endpoint (one query, long
  timeout, no polling loops).
- **EIA:** U.S. government public data; attribution appreciated, key is free.
- An EIA keyword match proves a generator exists — **not** that it serves the
  data center. BTM `confirmed` still requires a primary document.

## Candidate future feeds (not yet implemented)

- **Wikidata SPARQL** (CC0): `instance of: data center` with US coordinates.
- **EPA / state permit registries** for water withdrawal where digitized.
- **LBNL / DOE reports** for national context aggregates (manual, not API).
