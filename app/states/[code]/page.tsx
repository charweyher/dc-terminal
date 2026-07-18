import Link from "next/link";
import { notFound } from "next/navigation";
import Panel from "@/components/Panel";
import KpiCell from "@/components/KpiCell";
import { loadFacilities } from "@/lib/data";
import { computeKpis } from "@/lib/kpis";
import { USPS_STATES, STATE_NAMES } from "@/lib/states";

const fmt = new Intl.NumberFormat("en-US");

export function generateStaticParams() {
  return [
    ...new Set(loadFacilities().map((f) => f.location.state.toLowerCase())),
  ].map((code) => ({ code }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const name = STATE_NAMES[code.toUpperCase()] ?? "State";
  return { title: `${name} — DC Terminal` };
}

export default async function StatePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const usps = code.toUpperCase();
  if (!USPS_STATES.has(usps)) notFound();

  const facilities = loadFacilities().filter(
    (f) => f.location.state === usps
  );
  const k = computeKpis(facilities);

  return (
    <div className="flex flex-col gap-3 pt-6">
      <h1 className="font-sans text-xl font-semibold tracking-wide">
        {STATE_NAMES[usps] ?? usps}{" "}
        <span className="font-mono text-fg-muted">{usps}</span>
      </h1>

      {facilities.length === 0 ? (
        <Panel title="State Rollup">
          <div className="py-8 text-center font-mono text-[12px] text-fg-dim">
            No facilities in the current dataset for {usps}. This reflects
            dataset coverage, not the absence of data centers.
          </div>
        </Panel>
      ) : (
        <>
          <div className="panel-in grid grid-cols-2 rounded-[2px] border border-hairline bg-bg-1 md:grid-cols-3 lg:grid-cols-6 lg:divide-x lg:divide-hairline">
            <KpiCell label="In dataset" value={fmt.format(k.total)} />
            <KpiCell label="Operating" value={fmt.format(k.operating)} />
            <KpiCell
              label="Planned"
              value={fmt.format(k.planned)}
              subline={`+${k.under_construction} under construction`}
            />
            <KpiCell
              label="Operating MW"
              value={fmt.format(k.operating_mw_sum)}
              subline={`known for ${k.operating_mw_known_count} of ${k.operating}`}
            />
            <KpiCell
              label="BTM"
              value={`${k.btm_confirmed_count} conf · ${k.btm_reported_count} rpt`}
              subline={`${fmt.format(k.btm_confirmed_mw + k.btm_reported_mw)} MW on-site gen`}
            />
            <KpiCell
              label="Water known"
              value={`${k.water_any_known_count} of ${k.total}`}
              subline={`${k.water_coverage_pct}% coverage`}
            />
          </div>

          <Panel title={`Facilities in ${usps}`}>
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-hairline text-left font-mono text-[10px] uppercase tracking-[0.1em] text-fg-dim">
                  <th className="py-1.5 pr-2 font-medium">Facility</th>
                  <th className="py-1.5 pr-2 font-medium">Status</th>
                  <th className="py-1.5 pr-2 text-right font-medium">MW</th>
                  <th className="py-1.5 font-medium">Type</th>
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
                    <td className="py-1.5 pr-2 font-mono text-[11px] text-fg-muted">
                      {f.status.replace("_", " ")}
                    </td>
                    <td className="py-1.5 pr-2 text-right font-mono tabular-nums">
                      {typeof f.capacity.it_load_mw.value === "number" ? (
                        fmt.format(f.capacity.it_load_mw.value)
                      ) : (
                        <span className="text-fg-dim">—</span>
                      )}
                    </td>
                    <td className="py-1.5 font-mono text-[11px] text-fg-muted">
                      {f.facility_type.replace("_", " ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </>
      )}

      <div className="font-mono text-[11px] text-fg-muted">
        <Link href="/facilities" className="underline hover:text-fg">
          ← All facilities
        </Link>
      </div>
    </div>
  );
}
