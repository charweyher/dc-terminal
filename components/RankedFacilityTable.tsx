import Link from "next/link";
import type { Facility } from "@/lib/types";

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
  return (
    <table className="w-full text-[13px]">
      <thead>
        <tr className="border-b border-hairline text-left font-mono text-[10px] uppercase tracking-[0.1em] text-fg-dim">
          <th className="py-1.5 pr-2 font-medium">Facility</th>
          <th className="py-1.5 pr-2 font-medium">State</th>
          <th className="py-1.5 pr-2 text-right font-medium">MW</th>
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
            <td className="py-1.5 pr-2 text-right font-mono tabular-nums">
              {fmt.format(f.capacity.it_load_mw.value as number)}
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
