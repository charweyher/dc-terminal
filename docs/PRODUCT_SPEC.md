# Product Spec — DC Terminal

## Vision

DC Terminal is a public-data dashboard for US data centers. It answers three questions clearly:

1. How many facilities are **operating** vs **planned**?
2. How many are **behind the meter** (self-powered / on-site generation)?
3. What do we know about **water** use — and where are the gaps?

The product looks like a dense market terminal (Bloomberg-inspired chrome) with Cleanview-like information architecture: KPI strip, interactive map, ranked lists, state drill-downs.

---

## Users

| Persona | Need |
|---------|------|
| Policy / energy analyst | Counts, MW, BTM share by state |
| Journalist / researcher | Sourced facility facts + methodology |
| Investor / infrastructure | Planned pipeline, largest campuses, BTM risk |
| Curious citizen | Map of nearby activity + water context |

---

## User stories

1. As an analyst, I can see operating vs planned counts and MW for the current dataset, with capacity coverage noted.
2. As an analyst, I can filter the map and table to behind-the-meter facilities and see confirmed vs reported separately.
3. As a researcher, I can open a facility and see every claim’s source and confidence.
4. As a user, I can open a state page and see rollups for that state.
5. As a user, I can visit `/water` and understand national estimates vs facility-level knowns.
6. As a user, I can visit `/methodology` and understand why totals may be lower than commercial trackers like Cleanview.

---

## Pages & acceptance criteria

### `/` — Terminal home

- Brand wordmark **DC Terminal** is the dominant brand signal in the first viewport.
- One headline thesis (e.g. “US data center inventory — operating, planned, power, water”).
- KPI strip with the metrics defined in `CLAUDE.md`.
- Map preview (linked to `/map`).
- Tables: largest operating and largest planned by known MW.
- No marketing card grid; no fake “industry complete” claims.

### `/map`

- MapLibre map of CONUS (+ AK/HI if present in data).
- Marker color by status (operating / planned / under_construction).
- Marker size by known IT/critical load MW when available; fixed small size when MW unknown.
- Filters: status, BTM (yes/no/unknown), water-known, state, facility_type.
- Click → facility detail or side panel.

### `/facilities`

- Dense table: name, state, status, MW, BTM, water known?, type, operator.
- Sortable columns; text search; same filters as map.
- Row click → detail.

### `/facilities/[id]`

- Full facility record with confidence badges on capacity, BTM, water, location.
- Source list with links where URLs exist.
- Notes and last_reviewed.

### `/states/[code]`

- Counts and MW by status.
- BTM confirmed/reported counts and MW.
- Water coverage for facilities in that state.
- Link list or mini-table of facilities.

### `/behind-the-meter`

- Definition of BTM for this product (on-site generation serving the campus, partially or fully off-grid / private wire / dedicated generation — document assumptions).
- Ranked list of BTM facilities by onsite generation MW.
- Coverage callout: confirmed vs reported vs unknown.
- Link to methodology.

### `/water`

- Aggregate panel: facilities with any water metric; sums where comparable units exist.
- Optional national context block fed from `data/aggregates.water.json` (literature estimates) — clearly labeled as **external estimates**, not sums of facility rows.
- Table of facilities with known water fields.
- Gap callout: most facilities will be unknown.

### `/methodology`

- Confidence levels explained.
- Source registry summary.
- Pipeline overview.
- Explicit statement: dataset is a public aggregation, not a complete national census; commercial trackers may list more projects.

---

## Non-functional requirements

- TypeScript strict enough to type Facility and ConfidentValue.
- Mobile: usable; dense desktop is primary.
- Performance: map should handle hundreds of points smoothly; plan clustering if >500.
- Accessibility: keyboard focus for table; sufficient contrast on dark UI.
- Build: `npm run build` must pass.

---

## Out of scope (MVP)

- User accounts, alerts, paid data APIs.
- Scraping Cleanview / Baxtel.
- Real-time power market prices.
- Full EIA ETL automation (document + stub scripts only; manual curated JSON is fine for MVP).

---

## Success metrics (qualitative)

- A stranger understands operating vs planned vs BTM in under 30 seconds on `/`.
- A researcher can verify a BTM claim via linked sources in under two clicks.
- Water page never implies facility-complete national water accounting.
