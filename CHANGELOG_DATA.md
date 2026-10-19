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

## 0.4.0 — 2026-10-18

- **Sample fixture fully retired.** The `sample-schema-fixture` source was still cited by 17 rows (5 "(sample)" rows plus fields on 12 others). Every fixture-cited field now cites a public source or is set to `unknown`/null. Fixture values were dropped instead of re-cited where no primary source supports them; several matched a commercial tracker's listings, not a primary document. Source entry removed. 45 → 43 facilities.
- Sample rows:
  - `equinix-dc12-va` → **Equinix DC12 (Ashburn)**: OSM parcel coords; opened 2017 and indirect evaporative cooling (Equinix press release, confirmed). Illustrative water volumes removed, so water-known drops 3 → 2. MW not disclosed.
  - `stargate-nm-planned` → `stargate-project-jupiter-nm`, **Project Jupiter (Stargate New Mexico)**, Santa Teresa, Doña Ana County: now `under_construction`. The 2,450 MW figure is Distilled's on-site power plant, so it moved from `it_load_mw` (now unknown) to `onsite_generation_mw`. BTM `reported`. Air permit stayed and gas pipeline denied (Sept 2026), recorded in notes.
  - `vantage-quincy-wa` → **Vantage Quincy (WA1) campus**: 89 MW IT (confirmed); Grant County PUD grid; cooling corrected from evaporative to air (closed-loop air-cooled chillers per Vantage).
  - `aws-us-east-oha-oh` **removed**: a regional aggregate, not a facility. AWS does not publish site locations, and no primary source pins a specific operating Ohio site.
  - `qts-atlanta-campus-ga` **removed**: the only matching real site, QTS Fayetteville, is where AJC reporting places Microsoft Fairwater Atlanta, so a separate row would double-count the Fairwater rows.
- Other rows with fixture-cited fields:
  - `riot-rockdale-tx` (700 MW, operating 2020, ERCOT, immersion + air), `iren-childress-tx` (750 MW site power, ERCOT, air + liquid) and `hut8-king-mountain-tx` (280 MW, energized 2022) are now sourced from operator pages, filings and releases. Their MW figures are site power, not critical IT. King Mountain is now BTM `reported` (co-located wind, `hybrid`); GEM's doubts are disclosed in notes.
  - `fermi-matador-tx`: TCEQ permit 181009 supports on-site gas for the campus, so BTM goes `reported` → `confirmed` with 6 GW on-site generation. IT load and expected year → unknown (Distilled had no Fermi figures). Coords moved to the permit's US-60 / FM-2373 location.
  - `meta-hyperion-la` → **Meta Hyperion (Richland Parish)**: whole campus, now `under_construction`; ~2 GW by 2030 (CNBC), replacing the fixture's 5,238 MW / 2031; Entergy grid supply.
  - `edgecore-mesa-ph03-az` → `edgecore-mesa-az` (campus; PH03 was not yet operating): 206 MW commissioned (EdgeCore, May 2025), SRP grid, air-cooled.
  - `stream-phoenix-az`: location corrected to the Goodyear campus (OSM PHX-1); opened 2020; capacity unknown (280 MW unsourced).
  - `digital-realty-iad39-va`, `msft-fairwater-atl-b2-ga`/`-b4-ga`: untraceable MW and opening year → unknown; IAD39 moved to OSM parcel coords; Fairwater rows add AJC's Fayetteville reporting.
  - `google-council-bluffs-ia`: OSM parcel coords; fixture-only grid/BTM/cooling → unknown. `xai-colossus-1-tn`: fixture citation dropped (value kept on `xai-colossus-press`) and notes reworded.
- 21 new sources; `sample-schema-fixture` and the now-uncited `equinix-sustainability-2025` removed. `facilities.json` wrapper description no longer calls the dataset a sample fixture.
