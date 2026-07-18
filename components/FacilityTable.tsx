"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import FilterSelect, { CONTROL_CLASS } from "./FilterSelect";
import type { FacilityRow } from "@/lib/tableRows";
import {
  BTM_OPTIONS,
  WATER_OPTIONS,
  useFacilityFilters,
} from "@/lib/useFacilityFilters";

const fmt = new Intl.NumberFormat("en-US");

const STATUS_LABEL: Record<string, string> = {
  operating: "operating",
  planned: "planned",
  under_construction: "under constr.",
  cancelled: "cancelled",
};

const STATUS_COLOR: Record<string, string> = {
  operating: "text-operating",
  planned: "text-planned",
  under_construction: "text-planned",
  cancelled: "text-fg-dim",
};

// Table adds "cancelled" to the shared status filter options.
const TABLE_STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "operating", label: "Operating" },
  { value: "planned", label: "Planned" },
  { value: "under_construction", label: "Under construction" },
  { value: "cancelled", label: "Cancelled" },
];

type SortKey = "name" | "state" | "status" | "mw" | "type" | "operator";

const COLUMNS: Array<{ key: SortKey | "btm" | "water"; label: string; sortable: boolean }> = [
  { key: "name", label: "Facility", sortable: true },
  { key: "state", label: "St", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "mw", label: "MW", sortable: true },
  { key: "btm", label: "BTM", sortable: false },
  { key: "water", label: "H₂O", sortable: false },
  { key: "type", label: "Type", sortable: true },
  { key: "operator", label: "Operator", sortable: true },
];

export default function FacilityTable({ rows }: { rows: FacilityRow[] }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("mw");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const f = useFacilityFilters(rows);

  const types = useMemo(
    () => [...new Set(rows.map((r) => r.type))].sort(),
    [rows]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = f.filtered.filter((r) => {
      if (
        q &&
        ![r.name, r.operator ?? "", r.developer ?? ""].some((s) =>
          s.toLowerCase().includes(q)
        )
      )
        return false;
      if (type !== "all" && r.type !== type) return false;
      return true;
    });

    result.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "mw") {
        // Unknown MW always sorts last regardless of direction.
        if (a.mw === null && b.mw === null) return 0;
        if (a.mw === null) return 1;
        if (b.mw === null) return -1;
        return (a.mw - b.mw) * dir;
      }
      const av = (a[sortKey] ?? "").toString().toLowerCase();
      const bv = (b[sortKey] ?? "").toString().toLowerCase();
      return av.localeCompare(bv) * dir;
    });
    return result;
  }, [f.filtered, query, type, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "mw" ? "desc" : "asc");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          aria-label="Search facilities by name, operator, or developer"
          placeholder="Search name / operator / developer"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`w-64 ${CONTROL_CLASS}`}
        />
        <FilterSelect label="Status" value={f.status} onChange={f.setStatus} options={TABLE_STATUS_OPTIONS} />
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
        <FilterSelect
          label="Type"
          value={type}
          onChange={setType}
          options={[
            { value: "all", label: "All" },
            ...types.map((t) => ({ value: t, label: t.replace("_", " ") })),
          ]}
        />
        <span className="ml-auto font-mono text-[11px] text-fg-muted" aria-live="polite">
          {filtered.length} of {rows.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-[12.5px]">
          <thead className="bg-bg-1">
            <tr className="border-b border-hairline text-left font-mono text-[10px] uppercase tracking-[0.1em] text-fg-dim">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={`py-1.5 pr-2 font-medium ${col.key === "mw" ? "text-right" : ""}`}
                  aria-sort={
                    sortKey === col.key
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key as SortKey)}
                      className="uppercase tracking-[0.1em] hover:text-fg"
                    >
                      {col.label}
                      {sortKey === col.key ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-hairline/50 transition-colors hover:bg-bg-2">
                <td className="py-1.5 pr-2">
                  <Link href={`/facilities/${r.id}`} className="hover:underline">
                    {r.name}
                  </Link>
                </td>
                <td className="py-1.5 pr-2 font-mono text-fg-muted">{r.state}</td>
                <td className={`py-1.5 pr-2 font-mono text-[11px] ${STATUS_COLOR[r.status]}`}>
                  {STATUS_LABEL[r.status]}
                </td>
                <td className="py-1.5 pr-2 text-right font-mono tabular-nums">
                  {r.mw === null ? <span className="text-fg-dim">—</span> : fmt.format(r.mw)}
                </td>
                <td className="py-1.5 pr-2 font-mono text-[11px]">
                  {r.btm === true ? (
                    <span className="text-btm">yes</span>
                  ) : r.btm === false ? (
                    <span className="text-fg-muted">no</span>
                  ) : (
                    <span className="text-fg-dim">—</span>
                  )}
                </td>
                <td className="py-1.5 pr-2 font-mono text-[11px]">
                  {r.waterKnown ? (
                    <span className="text-water">yes</span>
                  ) : (
                    <span className="text-fg-dim">—</span>
                  )}
                </td>
                <td className="py-1.5 pr-2 font-mono text-[11px] text-fg-muted">
                  {r.type.replace("_", " ")}
                </td>
                <td className="py-1.5 text-fg-muted">{r.operator ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 ? (
          <div className="py-10 text-center font-mono text-[12px] text-fg-dim">
            No facilities match filters.
          </div>
        ) : null}
      </div>
    </div>
  );
}
