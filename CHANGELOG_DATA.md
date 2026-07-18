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

## 0.3.0 — 2026-07-18

- **All synthetic rows removed** (`cancelled-demo-or`, `confirmed-btm-demo-ok`, `nebius-nj-btm-planned`) and replaced with real, sourced equivalents serving the same KPI roles:
  - `msft-licking-county-oh` — real cancellation (Microsoft's $1B New Albany/Heath/Hebron plan, April 2025); county precision.
  - `greenidge-dresden-ny` — real **confirmed** BTM: bitcoin mining inside an operator-owned 106 MW gas plant (SEC issuer filings + Title V permit + EIA plant); hybrid interconnect (sells excess to NYISO).
  - `stargate-abilene-tx` — real under-construction BTM flagship: ~360 MW permitted on-site gas, 1,200 MW press-reported full buildout (labeled as such), city precision.
- Second Overpass curation batch: +7 Google campuses and +9 Meta campuses (OSM parcel coordinates, corroborated by the operators' official facility-list pages). Capacity/water left unknown where not publicly disclosed.
- 28 → 44 facilities. Water-known count drops 4 → 3 because a removed synthetic row carried illustrative water values — coverage now reflects only real disclosures.
- New sources: microsoft-licking-cancellation, greenidge-filings, gem-greenidge, stargate-abilene-press, google-datacenter-locations.

## 0.3.1 — 2026-07-18

- Added `galaxy-helios-dickens-tx` (Galaxy Digital Helios, Dickens County TX): operating AI campus, 133 MW critical IT load delivered to CoreWeave (Phase I, July 2026 press release), ERCOT grid-supplied, formerly Argo Blockchain's Helios bitcoin mine (2022). Coordinates from OSM ("Argo Data Center" way/1490401523). Sources: Galaxy Phase I + ERCOT press releases, Texas A&M TRERC analysis. 44 → 45 facilities.
