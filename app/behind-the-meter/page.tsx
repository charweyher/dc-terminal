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
          <th className="py-1.5 font-medium">Evidence</th>
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

  const btmTrue = rankByOnsiteGen(
    nonCancelled.filter((f) => f.power.behind_the_meter.value === true)
  );
  const unknownCount = nonCancelled.filter(
    (f) => f.power.behind_the_meter.confidence === "unknown"
  ).length;

  return (
    <div className="flex flex-col gap-3 pt-6">
      <h1 className="font-sans text-xl font-semibold tracking-wide">
        Behind-the-Meter Power
      </h1>

      <Panel title="What does behind-the-meter mean?">
        <div className="max-w-3xl space-y-2 text-[13px] text-fg-muted">
          <p>
            Most data centers plug into the electric grid like any large
            customer. A <span className="text-fg">behind-the-meter (BTM)</span>{" "}
            facility generates some or all of its own power on site — gas
            turbines, a dedicated power plant, or co-located generation under
            the operator&apos;s control — so that electricity reaches the
            servers without passing through a utility meter.
          </p>
          <p>
            <span className="text-fg">Why operators do it:</span> connecting a
            gigawatt-scale campus to the grid can take years of interconnection
            studies and new transmission construction. On-site generation lets
            a campus energize in months instead — xAI&apos;s Colossus in
            Memphis (reported gas turbines) and Galaxy&apos;s converted power
            infrastructure are examples of builders choosing speed. It can also
            insulate the local grid from a huge new load.
          </p>
          <p>
            <span className="text-fg">Why it&apos;s scrutinized:</span> on-site
            combustion needs air permits and produces local emissions, and BTM
            load is harder for regulators and grid planners to see. That&apos;s
            why this page separates what&apos;s <em>confirmed</em> by primary
            documents from what&apos;s <em>reported</em> by credible press.
          </p>
        </div>
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

      <Panel title={`All BTM facilities (${btmTrue.length}) — ranked by on-site generation`}>
        <p className="mb-2 max-w-3xl text-[13px] text-fg-muted">
          Every facility with on-site power in one list. The{" "}
          <span className="text-fg">Evidence</span> column is the key:{" "}
          <span className="font-mono text-[11px]">confirmed</span> means primary
          documents (permits, regulatory filings, EIA records);{" "}
          <span className="font-mono text-[11px]">reported</span> means credible
          journalism or company statements we could not yet verify against a
          primary document. Both are real entries — they differ in proof, and we
          never merge them in the counts above.
        </p>
        <BtmTable facilities={btmTrue} />
      </Panel>

      <Panel title="Coverage caveat">
        <p className="max-w-3xl text-[13px] text-fg-muted">
          BTM: {k.btm_confirmed_count} confirmed · {k.btm_reported_count}{" "}
          reported (of {nonCancelled.length} non-cancelled facilities in this
          dataset, {k.operating} operating). MW sums count only facilities with
          a known on-site generation figure; facilities with BTM = yes but
          unknown MW are listed with a dash and excluded from sums. These
          figures describe this curated dataset — not the U.S. fleet. Evidence
          standards:{" "}
          <Link href="/methodology" className="underline hover:text-fg">
            methodology
          </Link>
          . New to the topic? Start with{" "}
          <Link href="/learn" className="underline hover:text-fg">
            Data Centers 101
          </Link>
          .
        </p>
      </Panel>
    </div>
  );
}
