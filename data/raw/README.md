# Raw data directory

Place large third-party downloads here (EIA-860 zips, Excel extracts, PUDL caches).

## Rules

1. Prefer documenting the download URL and date over committing binaries.
2. Do not commit multi‑MB archives. They should be gitignored.
3. Any EIA plant ↔ data center join requires human review; record rationale on the facility `notes` field.
4. After processing, curated results belong in `data/facilities.json`, not in `raw/`.

## EIA-860 (manual)

1. Download the latest release from https://www.eia.gov/electricity/data/eia860/
2. Store the zip under `data/raw/eia860/` (gitignored).
3. Use plant/generator files for ≥1 MW units; do not assume a plant is a data center without corroboration.

## PUDL (optional)

See https://docs.catalyst.coop/pudl/en/stable/data_sources/eia860.html for normalized tables.
