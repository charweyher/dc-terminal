import type { DatasetKpis, Facility } from "./types";

function mwKnown(cv: { value: number | null }): number | null {
  return typeof cv.value === "number" ? cv.value : null;
}

/**
 * BTM MW prefers onsite_generation_mw; facilities without it are excluded
 * from MW sums (no fallback to it_load_mw without documented equivalence).
 */
function btmMw(f: Facility): number | null {
  return mwKnown(f.power.onsite_generation_mw);
}

export function computeKpis(facilities: Facility[]): DatasetKpis {
  const kpis: DatasetKpis = {
    total: facilities.length,
    operating: 0,
    planned: 0,
    under_construction: 0,
    cancelled: 0,
    operating_mw_sum: 0,
    operating_mw_known_count: 0,
    planned_mw_sum: 0,
    planned_mw_known_count: 0,
    btm_confirmed_count: 0,
    btm_confirmed_mw: 0,
    btm_reported_count: 0,
    btm_reported_mw: 0,
    btm_unknown_among_operating: 0,
    water_any_known_count: 0,
    water_coverage_pct: 0,
  };

  for (const f of facilities) {
    if (f.status === "operating") kpis.operating++;
    else if (f.status === "planned") kpis.planned++;
    else if (f.status === "under_construction") kpis.under_construction++;
    else if (f.status === "cancelled") kpis.cancelled++;

    const it = mwKnown(f.capacity.it_load_mw);
    if (f.status === "operating" && it !== null) {
      kpis.operating_mw_sum += it;
      kpis.operating_mw_known_count++;
    }
    // Planned MW aggregates planned + under_construction (label in UI).
    if (
      (f.status === "planned" || f.status === "under_construction") &&
      it !== null
    ) {
      kpis.planned_mw_sum += it;
      kpis.planned_mw_known_count++;
    }

    // BTM counts span all non-cancelled facilities; UI must label denominator.
    if (f.status !== "cancelled") {
      const btm = f.power.behind_the_meter;
      if (btm.value === true && btm.confidence === "confirmed") {
        kpis.btm_confirmed_count++;
        kpis.btm_confirmed_mw += btmMw(f) ?? 0;
      } else if (btm.value === true) {
        // Everything non-confirmed (reported, estimated) lands here so a
        // BTM=true row can never appear in the table but in neither KPI.
        kpis.btm_reported_count++;
        kpis.btm_reported_mw += btmMw(f) ?? 0;
      }
      if (f.status === "operating" && btm.confidence === "unknown") {
        kpis.btm_unknown_among_operating++;
      }
    }

    const w = f.water;
    if (
      mwKnown(w.withdrawal_mgd) !== null ||
      mwKnown(w.consumption_mgd) !== null ||
      mwKnown(w.wue_l_per_kwh) !== null
    ) {
      kpis.water_any_known_count++;
    }
  }

  kpis.water_coverage_pct =
    kpis.total === 0
      ? 0
      : Math.round((kpis.water_any_known_count / kpis.total) * 1000) / 10;

  return kpis;
}
