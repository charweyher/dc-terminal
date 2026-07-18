import type { Facility } from "./types";

/** Flat, client-serializable shape for map + filter UIs. */
export interface MapPoint {
  id: string;
  name: string;
  status: Facility["status"];
  state: string;
  precision: string;
  lng: number;
  lat: number;
  /** it_load_mw when known */
  mw: number | null;
  btm: boolean | null;
  btmConfidence: string;
  waterKnown: boolean;
}

export interface MapData {
  points: MapPoint[];
  /** Non-cancelled facilities with no usable coordinates */
  unmappedCount: number;
  states: string[];
}

export function toMapData(facilities: Facility[]): MapData {
  const points: MapPoint[] = [];
  let unmappedCount = 0;
  const states = new Set<string>();

  for (const f of facilities) {
    if (f.status === "cancelled") continue;
    states.add(f.location.state);
    const lat = f.location.lat.value;
    const lng = f.location.lng.value;
    if (typeof lat !== "number" || typeof lng !== "number") {
      unmappedCount++;
      continue;
    }
    points.push({
      id: f.id,
      name: f.name,
      status: f.status,
      state: f.location.state,
      precision: f.location.precision,
      lng,
      lat,
      mw:
        typeof f.capacity.it_load_mw.value === "number"
          ? f.capacity.it_load_mw.value
          : null,
      btm: f.power.behind_the_meter.value,
      btmConfidence: f.power.behind_the_meter.confidence,
      waterKnown: [
        f.water.withdrawal_mgd,
        f.water.consumption_mgd,
        f.water.wue_l_per_kwh,
      ].some((cv) => typeof cv.value === "number"),
    });
  }

  return { points, unmappedCount, states: [...states].sort() };
}
