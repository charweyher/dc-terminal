import type { Confidence, Facility } from "./types";

/** Flat client-serializable row for the facilities table. */
export interface FacilityRow {
  id: string;
  name: string;
  state: string;
  status: Facility["status"];
  type: Facility["facility_type"];
  operator: string | null;
  developer: string | null;
  mw: number | null;
  mwConfidence: Confidence;
  btm: boolean | null;
  btmConfidence: Confidence;
  waterKnown: boolean;
}

export function toFacilityRows(facilities: Facility[]): FacilityRow[] {
  return facilities.map((f) => ({
    id: f.id,
    name: f.name,
    state: f.location.state,
    status: f.status,
    type: f.facility_type,
    operator: f.operator,
    developer: f.developer,
    mw:
      typeof f.capacity.it_load_mw.value === "number"
        ? f.capacity.it_load_mw.value
        : null,
    mwConfidence: f.capacity.it_load_mw.confidence,
    btm: f.power.behind_the_meter.value,
    btmConfidence: f.power.behind_the_meter.confidence,
    waterKnown: [
      f.water.withdrawal_mgd,
      f.water.consumption_mgd,
      f.water.wue_l_per_kwh,
    ].some((cv) => typeof cv.value === "number"),
  }));
}
