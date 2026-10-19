import Link from "next/link";
import type { Facility } from "@/lib/types";
import { phaseOf } from "@/lib/rollups";

const fmt = new Intl.NumberFormat("en-US");

/** Facilities with known it_load_mw, descending; caller pre-filters status. */
export function rankByKnownMw(facilities: Facility[], limit: number): Facility[] {
  return facilities
    .filter((f) => typeof f.capacity.it_load_mw.value === "number")
    .sort(
      (a, b) =>
        (b.capacity.it_load_mw.value as number) -
        (a.capacity.it_load_mw.value as number)
    )
    .slice(0, limit);
}

export default function RankedFacilityTable({
  facilities,
}: {
  facilities: Facility[];
}) {
  if (facilities.length === 0) {
    return (
      <div className="py-6 text-center font-mono text-[12px] text-fg-dim">
        No facilities with known MW.
      </div>
    );
  }
  const max = Math.max(...facilities.map((f) => f.capacity.it_load_mw.value as number));
  return (
    <table className="w-full text-[13px]">
      <thead>
        <tr className="border-b border-hairline text-left font-mono text-[10px] uppercase tracking-[0.1em] text-fg-dim">
          <th className="py-1.5 pr-2 font-medium">Facility</th>
          <th className="py-1.5 pr-2 font-medium">State</th>
          <th className="w-[38%] py-1.5 pr-2 font-medium">MW</th>
          <th className="py-1.5 font-medium">Conf</th>
        </tr>
      </thead>
      <tbody>
        {facilities.map((f) => (
          <tr
            key={f.id}
            className="border-b border-hairline/50 transition-colors hover:bg-bg-2"
          >
            <td className="py-1.5 pr-2">
              <Link href={`/facilities/${f.id}`} className="hover:underline">
                {f.name}
              </Link>
            </td>
            <td className="py-1.5 pr-2 font-mono text-fg-muted">
              {f.location.state}
            </td>
            <td className="py-1.5 pr-2">
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1">
                  <div
                    className={`h-full rounded-r-[4px] ${
                      phaseOf(f) === "operating" ? "bg-chart-operating" : "bg-chart-pipeline"
                    }`}
                    style={{ width: `${((f.capacity.it_load_mw.value as number) / max) * 100}%` }}
                  />
                </div>
                <span className="w-12 text-right font-mono tabular-nums">
                  {fmt.format(f.capacity.it_load_mw.value as number)}
                </span>
              </div>
            </td>
            <td className="py-1.5 font-mono text-[10px] uppercase text-fg-dim">
              {f.capacity.it_load_mw.confidence.slice(0, 4)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
