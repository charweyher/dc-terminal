# DC Terminal

Public-data terminal for **US data centers**: operating vs planned counts, behind-the-meter / self-powered facilities, and water statistics where public sources allow — with honest coverage and confidence labels.

This repository currently contains the **Claude Code prompt pack** (specs, schema, sample data, phased prompts). The Next.js app is built by running the phases below inside this folder.

**UX references:** [Cleanview US map](https://cleanview.co/data-centers/us) for layout clarity; Bloomberg-like density for chrome. Do **not** scrape Cleanview’s database.

---

## Quick start (after Phase 1 exists)

```bash
cd "/Users/charweyher/Desktop/Data Centers Website"
npm install
npm run dev
```

Useful scripts (added during Phase 2):

```bash
npm run validate:data
npm run build
```

Until Phase 1 is complete, there is no `package.json` yet — start Claude Code with Phase 1 first.

---

## Run with Claude Code

1. Open this directory as the project root in Claude Code / your terminal.
2. Tell Claude to read `CLAUDE.md`.
3. Paste this session starter, then the phase file:

```text
You are implementing DC Terminal in this repo. Read CLAUDE.md first.
Follow the phase prompt I paste next exactly. Do not skip ahead to later phases.
After you finish, summarize what you built and how to verify it.
```

4. Run phases **in order**:

| Phase | File |
|-------|------|
| 1 Scaffold | [`prompts/phase-01-scaffold.md`](prompts/phase-01-scaffold.md) |
| 2 Data layer | [`prompts/phase-02-data-layer.md`](prompts/phase-02-data-layer.md) |
| 3 Map + home | [`prompts/phase-03-map-home.md`](prompts/phase-03-map-home.md) |
| 4 Table + states | [`prompts/phase-04-table-states.md`](prompts/phase-04-table-states.md) |
| 5 BTM + water + methodology | [`prompts/phase-05-btm-water-methodology.md`](prompts/phase-05-btm-water-methodology.md) |
| 6 Polish | [`prompts/phase-06-polish.md`](prompts/phase-06-polish.md) |

Overview: [`docs/BUILD_PHASES.md`](docs/BUILD_PHASES.md).

---

## Repo map

```text
CLAUDE.md                 Master brief for Claude Code
README.md                 This file
docs/
  PRODUCT_SPEC.md         Pages & acceptance criteria
  DATA_SCHEMA.md          Types + confidence model
  DATA_SOURCES.md         Allowed public sources
  DATA_PIPELINE.md        Ingest / validate / refresh
  DESIGN_SYSTEM.md        Terminal visual rules
  BUILD_PHASES.md         Phase index
prompts/                  Copy-paste phase prompts
data/
  sources.json            Source registry
  facilities.sample.json  20-facility schema fixture
  aggregates.water.json   National water context (external estimates)
  meta.json               Dataset version metadata
  raw/README.md           EIA download hygiene
CHANGELOG_DATA.md         Inventory change log
```

---

## Product focus

1. **How many** US data centers in the curated set — operating vs planned (and under construction).
2. **Behind the meter** — count and MW with `confirmed` vs `reported` confidence.
3. **Water** — facility-level when sourced; national literature estimates only as labeled context.

Figures reflect this repo’s public curated inventory, **not** a complete national census. Commercial trackers may list far more projects.

---

## Adding a facility (after the app exists)

1. Follow [`docs/DATA_PIPELINE.md`](docs/DATA_PIPELINE.md) and [`docs/DATA_SOURCES.md`](docs/DATA_SOURCES.md).
2. Add sources to `data/sources.json`.
3. Append to `data/facilities.json` using the schema in [`docs/DATA_SCHEMA.md`](docs/DATA_SCHEMA.md).
4. Run `npm run validate:data`.
5. Update `CHANGELOG_DATA.md` and `data/meta.json`.

---

## License / data honesty

Sample rows include illustrative and synthetic entries for UI testing (see facility `notes`). Replace or remove synthetic rows before publishing analytics. Respect upstream licenses when citing government, corporate, and academic sources.
