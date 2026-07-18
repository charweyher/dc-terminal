# Data Sources — DC Terminal

Public aggregation only. Prefer primary documents. Cite everything.

**Forbidden:** scraping or copying Cleanview’s facility database; importing paywalled Baxtel (or similar) dumps; inventing coordinates/MW/water.

Cleanview ([cleanview.co/data-centers/us](https://cleanview.co/data-centers/us)) is an **UX/IA reference only**.

---

## Source priority (highest → lowest)

1. **Government filings & open data** — EIA, EPA, state DEQ/air permits, PUC dockets, Census geography  
2. **Corporate primary** — 10-K/8-K, sustainability reports naming sites, official project pages  
3. **Academic / national lab** — LBNL, DOE, peer-reviewed water/energy papers  
4. **Reputable journalism** — named projects with dates; mark confidence `reported`  
5. **OpenStreetMap** — only when tags clearly indicate a data centre; treat coords as `parcel`/`exact` carefully  

---

## Allowed source classes

### Facility inventory (seed & growth)

| Class | Examples | Use |
|-------|----------|-----|
| Company disclosures | Hyperscaler sustainability / region pages | Name, status, sometimes water |
| State / local ED announcements | Governor / county press on campuses | Planned projects |
| Permit dockets | Air permits for on-site turbines | BTM evidence |
| OSM | `landuse=industrial` + `name` / `telecom=data_center` | Sparse locations |
| News | Reuters, local papers, Distilled.Earth-style reporting | BTM pipeline context (`reported`) |

Prefer **fewer high-quality rows** over a fake 3,000-row census.

### Power / behind-the-meter

| Source | URL / access | Use |
|--------|----------------|-----|
| EIA Form 860 | https://www.eia.gov/electricity/data/eia860/ | Generators ≥1 MW; plant location; fuel; proposed gens |
| PUDL (normalized EIA) | https://docs.catalyst.coop/pudl/ | Easier joins than raw EIA spreadsheets |
| State air permits | State DEQ portals | Gas turbines / generators at DC campuses |
| Journalism inventories | e.g. Distilled.Earth BTM reporting | Secondary BTM lists — cite, `reported` |

**BTM definition for this product:** on-site generation that primarily serves the data center campus (dedicated plant, behind-the-meter gas turbines, private wire, co-located generation under common control), as opposed to solely taking retail/wholesale grid power. Hybrid sites (grid + on-site) set `grid_interconnect: hybrid` and `behind_the_meter: true` when on-site gen is material to operations.

EIA alone does not label “data center BTM.” Linking requires name/location matching + human review. Document matches in `notes`.

### Water

| Source | Use |
|--------|-----|
| LBNL / DOE data center energy reports | National context estimates |
| EPA / state water notes | Policy context |
| Academic papers (hyperscale water geography, WUE studies) | National/regional estimates → `aggregates.water.json` |
| Corporate sustainability reports (Google, Meta, Equinix, etc.) | Sparse facility or regional water — often not site-level |
| Local permits / utility agreements | Rare facility-level withdrawal |

Default facility water fields to `unknown` until a concrete public figure exists.

### Geography

| Source | Use |
|--------|-----|
| US Census Cartographic Boundary files | State polygons for choropleth |
| Project filings / company maps | Exact or parcel coords |
| Geocoding city/county | `precision: city` or `county`; confidence `estimated` |

---

## Citation rules

1. Add every used source to `data/sources.json` with stable `id` (e.g. `eia-860-2024`, `distilled-btm-2026`).  
2. Reference `source_ids` on each `ConfidentValue` and on the facility’s top-level `source_ids`.  
3. Set `accessed_at` when you used the source.  
4. Prefer deep links to the specific PDF/HTML page.  
5. If a source may disappear, note archive URL in `license_notes` or `notes` on the facility.

---

## Honesty vs commercial trackers

Commercial trackers (Cleanview, Baxtel, etc.) may list ~1,000+ operating and ~1,000+ planned US projects. This dataset will start smaller. UI copy must say:

> Figures reflect DC Terminal’s public curated inventory, not a complete national census.

Never paste Cleanview’s headline numbers into KPIs unless independently reproduced from public sources in this repo.

---

## Starter registry

See `data/sources.json` for initial entries. Expand as the inventory grows.
