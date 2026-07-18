# Phase 6 — Polish & Runbook

Read first: `CLAUDE.md`, `docs/PRODUCT_SPEC.md`, `docs/DESIGN_SYSTEM.md`.

## Objective

Production-ready MVP polish and a clear README for humans + Claude Code continuation.

## Tasks

1. Unify filter UX between `/map` and `/facilities` (shared hook or component).
2. Empty / unknown states everywhere (unmapped facilities, unknown BTM, unknown water).
3. Subtle motion per design system (panel fade, map markers) — keep minimal.
4. Performance pass: avoid re-loading JSON repeatedly; consider `useMemo` only if already needed; map clustering if point count warrants.
5. Accessibility: focus states, table keyboard affordances, contrast check on muted text.
6. Rewrite root `README.md` as the operator runbook:
   - What DC Terminal is  
   - How to run (`npm install`, `npm run dev`, `validate:data`, `build`)  
   - How to run Claude Code phases  
   - How to add a facility (point to pipeline docs)  
   - Disclaimer about dataset scope  
7. Ensure `CLAUDE.md` still accurate; fix any drift.
8. Final `npm run validate:data` && `npm run build`.

## Acceptance criteria

- [ ] README alone is enough to run the app  
- [ ] No broken nav links  
- [ ] KPI disclosures present on home  
- [ ] Visual polish matches terminal brief  

## Do not

- Start large new features (auth, alerts, live EIA sync)  
- Expand dataset massively unless user asks  

When finished, provide a short handoff checklist for the human operator.
