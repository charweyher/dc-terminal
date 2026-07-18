# Data changelog

## 0.1.0 — 2026-07-18

- Initial `facilities.sample.json` (20 facilities) for schema + UI development.
- Initial `sources.json` registry and `aggregates.water.json` national context estimates.
- Mix of operating / planned / under_construction / cancelled; BTM confirmed + reported; sparse water fields.
- Includes clearly marked synthetic rows for confirmed-BTM and cancelled KPI tests.
- Phase 2: `facilities.json` initialized as a copy of the sample fixture (curated inventory starting point; no new rows).

## 0.1.1 — 2026-07-18

- `meta-hyperion-la`: corrected location from Richland Parish county centroid to the publicly announced Holly Ridge / Franklin Farm mega-site (32.351, −91.674), precision `county` → `site`, confidence `estimated` → `reported`; new source `meta-hyperion-richland-press`.
