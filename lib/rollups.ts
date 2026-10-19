import type { Confidence, ConfidentValue, Facility } from "./types";

/**
 * Chart rollups. Charts encode two phases only: operating vs pipeline
 * (planned + under construction). Cancelled rows are excluded and the
 * exclusion is stated in chart subtitles.
 */
export type Phase = "operating" | "pipeline";

export const PHASES: Phase[] = ["operating", "pipeline"];

export const PHASE_LABEL: Record<Phase, string> = {
  operating: "Operating",
  pipeline: "Planned + under construction",
};

export function phaseOf(f: Facility): Phase | null {
  if (f.status === "operating") return "operating";
  if (f.status === "planned" || f.status === "under_construction") return "pipeline";
  return null;
}

export const FACILITY_TYPE_LABEL: Record<Facility["facility_type"], string> = {
  hyperscale: "Hyperscale",
  colocation: "Colocation",
  enterprise: "Enterprise",
  crypto_mining: "Crypto mining",
  ai_campus: "AI campus",
  other: "Other",
};

/** Mark color for SVG fills; cancelled rows fall back to the dim text ink. */
export function phaseColor(f: Facility): string {
  const phase = phaseOf(f);
  return phase === "operating"
    ? "var(--chart-operating)"
    : phase === "pipeline"
      ? "var(--chart-pipeline)"
      : "var(--text-dim)";
}

/** Locator dot radius ∝ √MW (area ∝ MW), with a floor for unknown capacity. */
export function markerRadius(mw: number | null, min = 3.5, max = 14): number {
  if (typeof mw !== "number" || mw <= 0) return min;
  return Math.min(max, Math.max(min, Math.sqrt(mw) / 3.2));
}

export interface PhaseRow {
  key: string;
  label: string;
  href?: string;
  counts: Record<Phase, number>;
  total: number;
}

export function countByPhase(
  facilities: Facility[],
  keyOf: (f: Facility) => string,
  labelOf: (key: string) => string = (k) => k,
  hrefOf?: (key: string) => string
): PhaseRow[] {
  const rows = new Map<string, PhaseRow>();
  for (const f of facilities) {
    const phase = phaseOf(f);
    if (!phase) continue;
    const key = keyOf(f);
    let row = rows.get(key);
    if (!row) {
      row = {
        key,
        label: labelOf(key),
        href: hrefOf?.(key),
        counts: { operating: 0, pipeline: 0 },
        total: 0,
      };
      rows.set(key, row);
    }
    row.counts[phase] += 1;
    row.total += 1;
  }
  return [...rows.values()].sort(
    (a, b) => b.total - a.total || a.label.localeCompare(b.label)
  );
}

/**
 * Split rows into those drawn as bars and a long tail of single-facility groups.
 * Folding the tail into one "Other" bar would make it the longest bar and misread
 * as a leader, so callers list the tail in a note instead.
 */
export function splitTail(rows: PhaseRow[], minTotal = 2) {
  return {
    head: rows.filter((r) => r.total >= minTotal),
    tail: rows.filter((r) => r.total < minTotal),
  };
}

export interface YearBin {
  label: string;
  counts: Record<Phase, number>;
  /** First bin at or after the current year; the chart draws a "today" rule before it. */
  future: boolean;
}

const YEAR_BINS: Array<{ label: string; from: number; to: number }> = [
  { label: "≤2010", from: 0, to: 2010 },
  { label: "’11–15", from: 2011, to: 2015 },
  { label: "’16–19", from: 2016, to: 2019 },
  { label: "’20–22", from: 2020, to: 2022 },
  { label: "’23–25", from: 2023, to: 2025 },
  { label: "’26–27", from: 2026, to: 2027 },
  { label: "’28–30", from: 2028, to: 2030 },
];

export function yearBins(facilities: Facility[], currentYear: number) {
  const bins: YearBin[] = YEAR_BINS.map((b) => ({
    label: b.label,
    counts: { operating: 0, pipeline: 0 },
    future: b.from >= currentYear,
  }));
  let operatingKnown = 0;
  let operatingTotal = 0;
  let pipelineKnown = 0;
  let pipelineTotal = 0;

  for (const f of facilities) {
    const phase = phaseOf(f);
    if (!phase) continue;
    const year =
      phase === "operating"
        ? f.capacity.year_operational.value
        : f.capacity.expected_year.value;
    if (phase === "operating") operatingTotal += 1;
    else pipelineTotal += 1;
    if (typeof year !== "number") continue;
    const i = YEAR_BINS.findIndex((b) => year >= b.from && year <= b.to);
    if (i < 0) continue;
    bins[i].counts[phase] += 1;
    if (phase === "operating") operatingKnown += 1;
    else pipelineKnown += 1;
  }
  return { bins, operatingKnown, operatingTotal, pipelineKnown, pipelineTotal };
}

/* ---------------- Ledger: which key facts are sourced, per facility ---------------- */

export interface LedgerField {
  key: string;
  label: string;
  get: (f: Facility) => ConfidentValue<unknown>;
}

export const LEDGER_FIELDS: LedgerField[] = [
  { key: "coords", label: "Coordinates", get: (f) => f.location.lat },
  { key: "it_load", label: "IT load", get: (f) => f.capacity.it_load_mw },
  {
    key: "year",
    label: "Year online",
    get: (f) =>
      f.status === "operating" ? f.capacity.year_operational : f.capacity.expected_year,
  },
  { key: "grid", label: "Grid link", get: (f) => f.power.grid_interconnect },
  { key: "btm", label: "On-site power", get: (f) => f.power.behind_the_meter },
  { key: "cooling", label: "Cooling", get: (f) => f.water.cooling_type },
  { key: "withdrawal", label: "Water use", get: (f) => f.water.withdrawal_mgd },
  { key: "wue", label: "WUE", get: (f) => f.water.wue_l_per_kwh },
];

/** A fact counts as sourced only with a real value and a confidence above unknown. */
export function factConfidence(cv: ConfidentValue<unknown>): Confidence {
  if (cv.value === null || cv.value === "unknown") return "unknown";
  return cv.confidence;
}

export interface LedgerColumn {
  facility: Facility;
  cells: Array<{ field: LedgerField; confidence: Confidence; asOf: string | null }>;
  known: number;
}

export const CONFIDENCE_ORDER: Confidence[] = ["confirmed", "reported", "estimated", "unknown"];

export function buildLedger(facilities: Facility[]) {
  const totals: Record<Confidence, number> = {
    confirmed: 0,
    reported: 0,
    estimated: 0,
    unknown: 0,
  };
  const columns: LedgerColumn[] = facilities.map((facility) => {
    const cells = LEDGER_FIELDS.map((field) => {
      const cv = field.get(facility);
      const confidence = factConfidence(cv);
      totals[confidence] += 1;
      return { field, confidence, asOf: cv.as_of };
    });
    return { facility, cells, known: cells.filter((c) => c.confidence !== "unknown").length };
  });
  const rank = (c: LedgerColumn) =>
    c.cells.reduce(
      (s, cell) => s + (3 - CONFIDENCE_ORDER.indexOf(cell.confidence)),
      0
    );
  columns.sort(
    (a, b) =>
      b.known - a.known || rank(b) - rank(a) || a.facility.name.localeCompare(b.facility.name)
  );
  const cellCount = facilities.length * LEDGER_FIELDS.length;
  return {
    fields: LEDGER_FIELDS,
    columns,
    totals,
    cellCount,
    knownCount: cellCount - totals.unknown,
  };
}
