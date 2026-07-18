"use client";

import { useMemo, useState } from "react";

/** Common filterable shape shared by MapPoint and FacilityRow. */
export interface Filterable {
  status: string;
  state: string;
  btm: boolean | null;
  waterKnown: boolean;
}

/** Shared status/BTM/water/state filter state for map + table views. */
export function useFacilityFilters<T extends Filterable>(items: T[]) {
  const [status, setStatus] = useState("all");
  const [btm, setBtm] = useState("all");
  const [water, setWater] = useState("all");
  const [state, setState] = useState("all");

  const states = useMemo(
    () => [...new Set(items.map((i) => i.state))].sort(),
    [items]
  );

  const filtered = useMemo(
    () =>
      items.filter((i) => {
        if (status !== "all" && i.status !== status) return false;
        if (btm === "yes" && i.btm !== true) return false;
        if (btm === "no" && i.btm !== false) return false;
        if (btm === "unknown" && i.btm !== null) return false;
        if (water === "known" && !i.waterKnown) return false;
        if (state !== "all" && i.state !== state) return false;
        return true;
      }),
    [items, status, btm, water, state]
  );

  return {
    filtered,
    states,
    status,
    setStatus,
    btm,
    setBtm,
    water,
    setWater,
    state,
    setState,
  };
}

export const BTM_OPTIONS = [
  { value: "all", label: "All" },
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unknown", label: "Unknown" },
];

export const WATER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "known", label: "Known only" },
];

export const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "operating", label: "Operating" },
  { value: "planned", label: "Planned" },
  { value: "under_construction", label: "Under construction" },
];
