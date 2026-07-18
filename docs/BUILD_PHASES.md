# Build Phases — DC Terminal

Run **one phase per Claude Code session** (or clearly checkpoint between phases). After each phase: install deps if needed, run the app, run `npm run build`, fix errors, then proceed.

Copy the full text from the matching file in `prompts/` into Claude Code.

| Phase | Prompt file | Outcome |
|-------|-------------|---------|
| 1 | `prompts/phase-01-scaffold.md` | Next.js + Tailwind + shell layout + design tokens |
| 2 | `prompts/phase-02-data-layer.md` | Types, loaders, validators, KPIs from sample data |
| 3 | `prompts/phase-03-map-home.md` | Home KPIs + MapLibre map + ranked lists |
| 4 | `prompts/phase-04-table-states.md` | Facilities table, detail, state pages |
| 5 | `prompts/phase-05-btm-water-methodology.md` | BTM, water, methodology routes |
| 6 | `prompts/phase-06-polish.md` | Filters polish, empty states, README runbook |

## Global instructions for every phase

1. Read `CLAUDE.md` and the docs referenced in the phase prompt.  
2. Do not scrape Cleanview.  
3. Do not invent facility-level water or BTM facts beyond `data/`.  
4. Prefer extending existing files over re-architecting.  
5. Keep the Bloomberg-terminal design system.  

## Suggested session starter (paste before a phase prompt)

```text
You are implementing DC Terminal in this repo. Read CLAUDE.md first.
Follow the phase prompt I paste next exactly. Do not skip ahead to later phases.
After you finish, summarize what you built and how to verify it.
```

Then paste the phase file contents.
