"use client";

import { useState } from "react";
import FacilityMap from "./FacilityMap";
import MapLegend from "./MapLegend";
import FilterSelect from "./FilterSelect";
import type { MapData } from "@/lib/mapPoints";
import candidatesMeta from "@/data/osm-candidates.meta.json";
import {
  BTM_OPTIONS,
  STATUS_OPTIONS,
  WATER_OPTIONS,
  useFacilityFilters,
} from "@/lib/useFacilityFilters";

export default function MapExplorer({ data }: { data: MapData }) {
  const f = useFacilityFilters(data.points);
  const [showCandidates, setShowCandidates] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect label="Status" value={f.status} onChange={f.setStatus} options={STATUS_OPTIONS} />
        <FilterSelect label="BTM" value={f.btm} onChange={f.setBtm} options={BTM_OPTIONS} />
        <FilterSelect label="Water" value={f.water} onChange={f.setWater} options={WATER_OPTIONS} />
        <FilterSelect
          label="State"
          value={f.state}
          onChange={f.setState}
          options={[
            { value: "all", label: "All" },
            ...f.states.map((s) => ({ value: s, label: s })),
          ]}
        />
        <label className="flex cursor-pointer items-center gap-1.5 rounded-[2px] border border-hairline bg-bg-2 px-2 py-1 font-mono text-[11px] uppercase text-fg-dim">
          <input
            type="checkbox"
            checked={showCandidates}
            onChange={(e) => setShowCandidates(e.target.checked)}
            className="accent-fg-dim"
          />
          OSM-reported ({candidatesMeta.count.toLocaleString()} unverified)
        </label>
        <span className="ml-auto font-mono text-[11px] text-fg-muted" aria-live="polite">
          {f.filtered.length} of {data.points.length} mapped
        </span>
      </div>
      <FacilityMap points={f.filtered} heightClass="h-[560px]" showCandidates={showCandidates} />
      {f.filtered.length === 0 ? (
        <div className="py-2 text-center font-mono text-[12px] text-fg-dim">
          No facilities match filters.
        </div>
      ) : null}
      <MapLegend unmappedCount={data.unmappedCount} showCandidates={showCandidates} />
      {showCandidates ? (
        <p className="font-mono text-[11px] text-fg-dim">
          Gray dots are raw OpenStreetMap data-centre tags (© OpenStreetMap
          contributors, ODbL) — uncurated, unverified, and excluded from every
          KPI. Curated facilities are drawn on top; see{" "}
          <a href="/methodology" className="underline">methodology</a>.
        </p>
      ) : null}
    </div>
  );
}
