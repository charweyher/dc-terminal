# Phase 5 — BTM, Water, Methodology

Read first: `docs/PRODUCT_SPEC.md` (BTM/water/methodology), `docs/DATA_SOURCES.md`, `docs/DATA_PIPELINE.md`.

## Objective

Ship the three credibility pages that differentiate DC Terminal: behind-the-meter, water, and methodology.

## Tasks

1. `/behind-the-meter`
   - Define BTM per product docs  
   - Ranked list of facilities with `behind_the_meter.value === true`, split or badge confirmed vs reported  
   - Coverage callout vs operating (or all) facilities  
   - MW sums using rules from schema  
2. `/water`
   - Facility table where any water field is known  
   - Coverage %.  
   - Load `data/aggregates.water.json` if present for a clearly labeled **external estimates** panel (create a small honest file from sources already in `sources.json` if missing — do not invent precise facility water)  
   - Gap callout: most sites unknown  
3. `/methodology`
   - Confidence levels  
   - Pipeline summary  
   - Source list (from registry)  
   - Non-completeness disclaimer vs commercial trackers  
4. Cross-link these pages from home KPI sublines where relevant.
5. `npm run build` passes.

## Acceptance criteria

- [ ] BTM page never conflates confirmed and reported without labels  
- [ ] Water page never presents literature estimates as sums of facility rows  
- [ ] Methodology mentions public aggregation + no Cleanview scraping  

## Do not

- Invent new facility water numbers  
- Scrape external sites to fill gaps in this phase (curate only if user provides sources)  

When finished, summarize coverage stats from the current dataset.
