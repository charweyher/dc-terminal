# Data Pipeline — DC Terminal

Public aggregation workflow for growing `data/facilities.json` without inventing completeness.

```text
Public sources → data/raw/ (optional) → normalize + confidence → data/facilities.json
                                              ↓
                                    validate script
                                              ↓
                                    CHANGELOG_DATA.md + meta version bump
                                              ↓
                                    Next.js loaders → KPIs / map / tables
```

---

## Directory layout

```text
data/
  sources.json              # source registry
  facilities.sample.json    # schema fixture (always present)
  facilities.json           # curated inventory (create in Phase 2; may start as copy of sample)
  aggregates.water.json     # optional national literature estimates
  meta.json                 # dataset version metadata
  raw/                      # optional downloads (gitignored if large)
    README.md               # what belongs here
scripts/
  validate-data.mjs         # Phase 2: schema checks
  # future: fetch-eia notes / helpers
CHANGELOG_DATA.md           # human log of inventory changes
```

---

## Ingest process (manual MVP)

1. **Identify** a facility from an allowed source (`docs/DATA_SOURCES.md`).  
2. **Create/update** a facility object matching `docs/DATA_SCHEMA.md`.  
3. **Wrap** capacity, BTM, water, and coordinates in `ConfidentValue`.  
4. **Register** any new sources in `sources.json`.  
5. **Run** `node scripts/validate-data.mjs` (or `npm run validate:data`).  
6. **Append** a bullet to `CHANGELOG_DATA.md` and bump `data/meta.json` version.  
7. **Smoke-check** KPIs in the app.

### Confidence assignment cheat sheet

| Evidence | Confidence |
|----------|------------|
| EIA plant row + permit matching the campus | `confirmed` |
| Company names the site MW in an official report | `confirmed` |
| Major outlet reports BTM turbines at named site | `reported` |
| City-level geocode only | coords `estimated`, precision `city` |
| No water figure found | water fields `unknown` / null |

---

## Validation (required)

`scripts/validate-data.mjs` should:

- Parse `facilities.json` (or sample if curated missing)  
- Enforce rules in `docs/DATA_SCHEMA.md`  
- Exit non-zero on failure  
- Print counts: operating / planned / BTM confirmed / water known  

Wire as `"validate:data": "node scripts/validate-data.mjs"` in `package.json` once the app exists.

---

## EIA / PUDL (later, optional automation)

Do **not** commit multi‑MB EIA zips by default.

1. Document download steps in `data/raw/README.md`.  
2. Add `.gitignore` entries for `data/raw/**/*.zip`, `*.xlsx`.  
3. Human review required for any EIA plant ↔ data center join; store the join rationale in `notes`.  
4. PUDL may be used locally; document the table names used.

---

## Dataset metadata

`data/meta.json` example:

```json
{
  "name": "DC Terminal US Facilities",
  "version": "0.1.0",
  "schema_version": "1",
  "last_updated": "2026-07-18",
  "facility_count": 20,
  "notes": "Sample-seeded public aggregation; not a national census."
}
```

---

## CHANGELOG_DATA.md format

```markdown
# Data changelog

## 0.1.0 — 2026-07-18
- Initial sample facilities for schema + UI development.
```

---

## App methodology page

`/methodology` must summarize this pipeline, confidence levels, and the non-completeness disclaimer. Keep that page in sync when pipeline rules change.

---

## Anti-patterns

- Bulk-importing scraped commercial databases  
- Filling null MW with “industry average” silently  
- Summing literature national water estimates into facility totals  
- Geocoding everything to state centroids without marking `precision`
