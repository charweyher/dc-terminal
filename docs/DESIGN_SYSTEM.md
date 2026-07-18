# Design System — DC Terminal

Bloomberg-terminal density + Cleanview information architecture. Do not copy Bloomberg or Cleanview branding/assets.

---

## Brand

- **Product name:** DC Terminal  
- **First viewport brand test:** After removing nav chrome, the wordmark **DC Terminal** must still dominate. One headline, one short supporting sentence, KPI strip, map plane.  
- **No** inset hero image cards, floating promo badges, or stat-pill clusters beyond the KPI strip.

---

## Color tokens (CSS variables)

Near-black terminal canvas. Avoid purple SaaS palettes and cream/serif “AI default” looks.

```css
:root {
  --bg-0: #0a0c0f;       /* page */
  --bg-1: #0e1218;       /* panel */
  --bg-2: #141a22;       /* elevated panel / hover */
  --border: #243041;     /* hairline */
  --border-strong: #3a4d63;

  --text: #e6edf5;
  --text-muted: #8b9bb0;
  --text-dim: #5c6b7e;

  --accent-operating: #3b82f6; /* cool blue */
  --accent-planned: #f59e0b;   /* amber */
  --accent-btm: #22c55e;       /* green */
  --accent-danger: #ef4444;
  --accent-water: #38bdf8;     /* sky */

  --mono: "IBM Plex Mono", "JetBrains Mono", "SF Mono", ui-monospace, monospace;
  --sans: "IBM Plex Sans", "Source Sans 3", "Helvetica Neue", sans-serif;
}
```

Load expressive fonts via `next/font` or Google Fonts — **not** Inter/Roboto/Arial as the primary stack.

---

## Typography

| Role | Style |
|------|--------|
| Wordmark | Sans, semibold/bold, tracking slightly wide |
| KPI value | Mono, tabular nums, large |
| KPI label | Sans, uppercase or small caps feel, muted, 10–11px |
| Table | Dense; mono for numbers; sans for names |
| Body | Sans, 14px, muted on secondary text |

---

## Layout

- Dense 12-column grid; hairline panel borders; minimal radius (0–2px).  
- Panels flush; avoid large card shadows.  
- KPI strip: one horizontal band of metric cells separated by hairlines.  
- Map: full-bleed within its panel; dark basemap style.  
- Desktop-first; stack KPIs in a 2×N grid on mobile.

### Home composition (first viewport)

1. Top bar: DC Terminal + primary nav links  
2. Thesis line (one sentence)  
3. KPI strip  
4. Map plane (dominant visual)  
5. Below fold: largest operating / planned tables  

---

## Status & data colors

| Concept | Color |
|---------|--------|
| Operating | `--accent-operating` |
| Planned / under construction | `--accent-planned` (differentiate under_construction with dashed border or lighter amber) |
| BTM | `--accent-btm` |
| Water known | `--accent-water` |
| Unknown / null | `--text-dim` — show em dash or “—” |

Confidence badges: tiny mono labels `CONF` / `RPT` / `EST` / `UNK` with border; do not use emoji.

---

## Components

- **Panel** — `bg-1`, `1px solid border`, optional title bar with muted label  
- **KPI cell** — label + value + optional subline (coverage)  
- **Data table** — sticky header, zebra optional at very low contrast, row hover `bg-2`  
- **Filter bar** — compact selects/checkboxes; no pill clouds  
- **Map legend** — operating / planned / BTM overlay  

**Cards:** default no cards. Interactive containers only when needed (filters, drawers).

---

## Motion

2–3 intentional motions only:

1. Panel content fade/slide-in on first paint (subtle, &lt;300ms)  
2. Map marker appear / cluster transition  
3. Table row highlight on selection  

No parallax, no glow pulses, no gradient animation.

---

## Map styling

- Dark basemap (MapLibre style JSON or free dark tiles).  
- Operating markers: blue; planned: amber.  
- Radius ∝ sqrt(MW) when MW known; minimum radius when unknown.  
- Optional BTM ring in green.  
- US center default view ~ lat 39.8, lng -98.5, zoom ~3.5.

---

## Copy tone

Terse, factual, terminal-like. Prefer:

`Operating 12 · Planned 8 · BTM 3 conf / 2 rpt`

Over marketing fluff. Always disclose dataset scope on KPI sublines and methodology.
