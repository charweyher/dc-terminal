# Phase 1 — Scaffold

Read first: `CLAUDE.md`, `docs/DESIGN_SYSTEM.md`, `docs/PRODUCT_SPEC.md` (routes overview only).

## Objective

Create a Next.js (App Router) + TypeScript + Tailwind application with the DC Terminal shell, design tokens, and placeholder routes. **No MapLibre or real data wiring yet** beyond static placeholders.

## Tasks

1. Scaffold Next.js in the repo root (App Router, TypeScript, Tailwind, ESLint). If files already exist from a partial scaffold, extend them instead of duplicating.
2. Add fonts per `docs/DESIGN_SYSTEM.md` (IBM Plex Sans + IBM Plex Mono or equivalent via `next/font`).
3. Define CSS variables from the design system in `globals.css`.
4. Build a terminal shell:
   - Top bar with wordmark **DC Terminal**
   - Nav links: Home, Map, Facilities, BTM, Water, Methodology
   - Dark background, hairline borders
5. Create placeholder pages for all routes listed in `CLAUDE.md` (empty panels with page titles are fine).
6. Home page first viewport: wordmark, one thesis sentence, placeholder KPI strip (static dashes), placeholder map panel (“Map — Phase 3”).
7. Add a root `README` section or leave README for Phase 6 — do not block on full docs.
8. Ensure `npm run dev` and `npm run build` succeed.

## Acceptance criteria

- [ ] App runs locally  
- [ ] All routes resolve  
- [ ] Visual language matches design tokens (no purple SaaS theme)  
- [ ] Brand **DC Terminal** is clear on `/`  

## Do not

- Implement MapLibre yet  
- Parse facility JSON yet  
- Scrape any external facility database  

When finished, summarize files created and how to run the app.
