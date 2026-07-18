# Data changelog

## 0.1.0 — 2026-07-18

- Initial `facilities.sample.json` (20 facilities) for schema + UI development.
- Initial `sources.json` registry and `aggregates.water.json` national context estimates.
- Mix of operating / planned / under_construction / cancelled; BTM confirmed + reported; sparse water fields.
- Includes clearly marked synthetic rows for confirmed-BTM and cancelled KPI tests.
- Phase 2: `facilities.json` initialized as a copy of the sample fixture (curated inventory starting point; no new rows).

## 0.1.1 — 2026-07-18

- `meta-hyperion-la`: corrected location from Richland Parish county centroid to the publicly announced Holly Ridge / Franklin Farm mega-site (32.351, −91.674), precision `county` → `site`, confidence `estimated` → `reported`; new source `meta-hyperion-richland-press`.

## 0.2.0 — 2026-07-18

- First curation batch from live ingest feeds (+8 operating facilities, 20 → 28 rows). Coordinates from OpenStreetMap (`osm-overpass-datacenters`, parcel precision); each row corroborated by a second public source:
  - `google-the-dalles-or` — with 2024 water records (1.263 MGD withdrawal / 0.99 MGD consumption) from The Oregonian public-records case.
  - `switch-citadel-tahoe-reno-nv` — TR1 130 MW (corporate "up to" figure).
  - `meta-prineville-or`, `meta-gallatin-tn` — water left unknown (Meta publishes fleet WUE only).
  - `meta-los-lunas-nm` — BTM=false (reported): NMRD solar serves it via PPA as separate EIA plants.
  - `microsoft-san-antonio-tx`, `apple-mesa-az`, `digital-realty-350-cermak-il` (109 MW total-power figure).
- New sources: google-dalles-water-records, switch-citadel-press, meta-datacenter-pages, microsoft-local-sanantonio, apple-mesa-press, cermak-350-press.
- Fix: `meta-hyperion-la` precision `site` → `parcel` (0.1.1 used a value outside the schema enum); validator now enforces precision and facility_type enums.
