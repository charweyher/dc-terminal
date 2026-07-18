# DC Terminal — Claude Code Master Brief

You are building **DC Terminal**: a US data-center intelligence website with a Cleanview-inspired information architecture and a Bloomberg-terminal visual density.

This repository contains the **implemented Next.js application** plus the prompt pack, data schema, sample data, and specs it was built from. All six build phases (`docs/BUILD_PHASES.md`, `prompts/`) are complete; ongoing work means expanding the curated dataset and refining features under the same rules. App code lives in `app/`, `components/`, `lib/`, and `scripts/` (types in `lib/types.ts`, loaders in `lib/data.ts`, KPIs in `lib/kpis.ts`).

---

## Product goals (non-negotiable)

1. **Counts:** How many US data centers are **operating** vs **planned** (plus under construction when data exists).
2. **Behind-the-meter (BTM):** How many facilities (and MW) supply or plan to supply their own on-site power — with honest coverage disclosure.
3. **Water:** Surface water withdrawal/consumption/WUE where public data exists; never invent facility-level water numbers.
4. **Map + tables:** Interactive US map and dense, filterable facility tables.
5. **Credibility:** Every sensitive KPI shows confidence and coverage. Prefer incomplete truth over fake completeness.

Working name: **DC Terminal**.

UX north star: [Cleanview US Data Centers](https://cleanview.co/data-centers/us) for layout clarity (KPI strip, map, ranked lists, state drill-down) + Bloomberg-like density (dark canvas, monospace metrics, panel chrome, filterable tables).

---

## Hard rules

### Do NOT

- Scrape, mirror, or copy Cleanview’s proprietary facility database (or any paywalled inventory like Baxtel dumps).
- Fabricate national totals that imply Cleanview-scale completeness unless the local `data/` inventory actually supports them.
- Hide unknowns. Use `unknown` / `null` and show coverage in the UI.
- Use purple SaaS gradients, Inter/Roboto default stacks as the primary brand look, or card-heavy marketing heroes.
- Commit secrets, API keys, or large raw EIA zips into git without documenting size and `.gitignore` rules.

### DO

- Aggregate from **public** sources listed in `docs/DATA_SOURCES.md`.
- Use the confidence model in `docs/DATA_SCHEMA.md` for capacity, BTM, water, and coordinates.
- Cite sources via `data/sources.json` IDs on every facility claim.
- Include crypto/mining campuses when public sources treat them as compute/data-center facilities; tag with `facility_type` so users can filter.
- Keep the methodology page accurate and prominent.

---

## Locked tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS + CSS variables from `docs/DESIGN_SYSTEM.md` |
| Map | MapLibre GL + free basemap (no paid map key required for MVP) |
| Charts | Recharts (or equivalent) in terminal styling |
| Data (MVP) | Versioned JSON under `data/` + typed loaders; aggregates in TypeScript |
| Hosting | Vercel-ready |

Start from sample data: `data/facilities.sample.json`. Expand into `data/facilities.json` as the curated inventory grows. Keep `facilities.sample.json` as the schema fixture.

---

## Site routes to implement

| Route | Purpose |
|-------|---------|
| `/` | Terminal home: brand, thesis, KPI strip, map preview, largest operating/planned |
| `/map` | Full interactive map + filters (status, BTM, water-known, state) |
| `/facilities` | Dense Bloomberg-style table + search/filters |
| `/facilities/[id]` | Facility detail (or drawer + shareable route) |
| `/states/[code]` | State rollups |
| `/behind-the-meter` | BTM explainer, ranked list, coverage callouts |
| `/water` | Water aggregates, known facilities, gap callout |
| `/methodology` | Sources, confidence rules, known gaps |

---

## Primary KPIs (home strip)

Always compute from the loaded dataset and show coverage:

1. Total facilities in dataset  
2. Operating count  
3. Planned count (include under_construction in a clear sub-metric or separate cell)  
4. Operating capacity (MW) — sum where capacity known  
5. Planned capacity (MW) — sum where capacity known  
6. BTM confirmed count + MW; BTM reported count + MW; denominator = operating (or all — label clearly)  
7. Water coverage: facilities with any water metric known vs total  

Example disclosure format:  
`BTM: 3 confirmed · 2 reported (of 12 operating in dataset)`

---

## Read these docs before coding

1. `docs/PRODUCT_SPEC.md` — acceptance criteria  
2. `docs/DATA_SCHEMA.md` — types and confidence model  
3. `docs/DATA_SOURCES.md` — allowed sources  
4. `docs/DATA_PIPELINE.md` — ingest/validate/refresh  
5. `docs/DESIGN_SYSTEM.md` — visual rules  
6. `docs/BUILD_PHASES.md` — phase order  

Execute **one phase at a time** using the matching file in `prompts/`. Do not skip phases. After each phase, ensure `npm run build` (or the equivalent) succeeds before starting the next.

---

## Phase order (summary)

1. Scaffold app + shell + design tokens  
2. Data layer + KPI aggregators  
3. Home + MapLibre map  
4. Facilities table, detail, state pages  
5. BTM + water + methodology pages  
6. Polish, empty states, README runbook  

---

## Definition of done (product MVP)

- [ ] All routes above render with sample (then curated) data  
- [ ] Map shows operating vs planned; filters work  
- [ ] KPIs never claim completeness they don’t have  
- [ ] BTM and water pages explain gaps  
- [ ] Methodology lists sources and confidence rules  
- [ ] `npm run build` passes  
- [ ] No Cleanview scraping code or copied proprietary rows  

---

## When expanding the dataset

Follow `docs/DATA_PIPELINE.md`. Bump `data/meta.json` version and append to `CHANGELOG_DATA.md`. Prefer fewer high-quality, sourced rows over inventing a Cleanview-sized catalog.
