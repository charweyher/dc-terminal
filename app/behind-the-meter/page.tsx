import Link from "next/link";
import Panel from "@/components/Panel";
import KpiCell from "@/components/KpiCell";
import ConfidenceBadge from "@/components/ConfidenceBadge";
import { loadFacilities } from "@/lib/data";
import { computeKpis } from "@/lib/kpis";
import type { Facility } from "@/lib/types";

export const metadata = { title: "Behind-the-Meter — DC Terminal" };

const fmt = new Intl.NumberFormat("en-US");

function BtmTable({ facilities }: { facilities: Facility[] }) {
  if (facilities.length === 0) {
    return (
      <div className="py-6 text-center font-mono text-[12px] text-fg-dim">
        None in the current dataset.
      </div>
    );
  }
  return (
    <table className="w-full text-[13px]">
      <thead>
        <tr className="border-b border-hairline text-left font-mono text-[10px] uppercase tracking-[0.1em] text-fg-dim">
          <th className="py-1.5 pr-2 font-medium">Facility</th>
          <th className="py-1.5 pr-2 font-medium">St</th>
          <th className="py-1.5 pr-2 font-medium">Status</th>
          <th className="py-1.5 pr-2 text-right font-medium">On-site gen MW</th>
          <th className="py-1.5 pr-2 font-medium">Fuel</th>
          <th className="py-1.5 font-medium">BTM conf</th>
        </tr>
      </thead>
      <tbody>
        {facilities.map((f) => (
          <tr key={f.id} className="border-b border-hairline/50 transition-colors hover:bg-bg-2">
            <td className="py-1.5 pr-2">
              <Link href={`/facilities/${f.id}`} className="hover:underline">
                {f.name}
              </Link>
            </td>
            <td className="py-1.5 pr-2 font-mono text-fg-muted">{f.location.state}</td>
            <td className="py-1.5 pr-2 font-mono text-[11px] text-fg-muted">
              {f.status.replace("_", " ")}
            </td>
            <td className="py-1.5 pr-2 text-right font-mono tabular-nums">
              {typeof f.power.onsite_generation_mw.value === "number" ? (
                fmt.format(f.power.onsite_generation_mw.value)
              ) : (
                <span className="text-fg-dim">—</span>
              )}
            </td>
            <td className="py-1.5 pr-2 font-mono text-[11px] text-fg-muted">
              {f.power.fuel_types.length > 0
                ? f.power.fuel_types.map((t) => t.replace(/_/g, " ")).join(", ")
                : "—"}
            </td>
            <td className="py-1.5">
              <ConfidenceBadge confidence={f.power.behind_the_meter.confidence} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function rankByOnsiteGen(facilities: Facility[]): Facility[] {
  return [...facilities].sort((a, b) => {
    const am = a.power.onsite_generation_mw.value;
    const bm = b.power.onsite_generation_mw.value;
    if (am === null && bm === null) return 0;
    if (am === null) return 1;
    if (bm === null) return -1;
    return bm - am;
  });
}

export default function BehindTheMeterPage() {
  const facilities = loadFacilities();
  const k = computeKpis(facilities);
  const nonCancelled = facilities.filter((f) => f.status !== "cancelled");

  const btmTrue = nonCancelled.filter(
    (f) => f.power.behind_the_meter.value === true
  );
  const confirmed = rankByOnsiteGen(
    btmTrue.filter((f) => f.power.behind_the_meter.confidence === "confirmed")
  );
  const reported = rankByOnsiteGen(
    btmTrue.filter((f) => f.power.behind_the_meter.confidence !== "confirmed")
  );
  const unknownCount = nonCancelled.filter(
    (f) => f.power.behind_the_meter.confidence === "unknown"
  ).length;

  return (
    <div className="flex flex-col gap-3 pt-6">
      <h1 className="font-sans text-xl font-semibold tracking-wide">
        Behind-the-Meter Power
      </h1>

      <Panel title="What counts as BTM here">
        <p className="max-w-3xl text-[13px] text-fg-muted">
          On-site generation that primarily serves the data center campus —
          dedicated plant, behind-the-meter gas turbines, private wire, or
          co-located generation under common control — as opposed to solely
          taking retail/wholesale grid power. Hybrid sites (grid + on-site) are
          flagged BTM when on-site generation is material to operations.
          Evidence standards are described on the{" "}
          <Link href="/methodology" className="underline hover:text-fg">
            methodology page
          </Link>
          .
        </p>
      </Panel>

      <div className="panel-in grid grid-cols-2 rounded-[2px] border border-hairline bg-bg-1 md:grid-cols-4 lg:divide-x lg:divide-hairline">
        <KpiCell
          label="Confirmed BTM"
          value={fmt.format(k.btm_confirmed_count)}
          subline={`${fmt.format(k.btm_confirmed_mw)} MW on-site gen`}
        />
        <KpiCell
          label="Reported BTM"
          value={fmt.format(k.btm_reported_count)}
          subline={`${fmt.format(k.btm_reported_mw)} MW on-site gen`}
        />
        <KpiCell
          label="Denominator"
          value={fmt.format(nonCancelled.length)}
          subline="non-cancelled facilities in dataset"
        />
        <KpiCell
          label="BTM status unknown"
          value={fmt.format(unknownCount)}
          subline="no usable public evidence either way"
        />
      </div>

      <Panel title={`Confirmed (${confirmed.length}) — primary documents`}>
        <BtmTable facilities={confirmed} />
      </Panel>

      <Panel title={`Reported (${reported.length}) — credible secondary sources, not independently verified`}>
        <BtmTable facilities={reported} />
      </Panel>

      <Panel title="Coverage caveat">
        <p className="max-w-3xl text-[13px] text-fg-muted">
          BTM: {k.btm_confirmed_count} confirmed · {k.btm_reported_count}{" "}
          reported (of {nonCancelled.length} non-cancelled facilities in this
          dataset, {k.operating} operating). MW sums count only facilities with
          a known on-site generation figure; facilities with BTM = yes but
          unknown MW are listed with a dash and excluded from sums. These
          figures describe this curated dataset — not the U.S. fleet.
        </p>
      </Panel>
    </div>
  );
}
