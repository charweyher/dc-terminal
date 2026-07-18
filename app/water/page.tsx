import Link from "next/link";
import Panel from "@/components/Panel";
import KpiCell from "@/components/KpiCell";
import ConfidenceBadge from "@/components/ConfidenceBadge";
import { loadFacilities, loadWaterContext } from "@/lib/data";
import { computeKpis } from "@/lib/kpis";

export const metadata = { title: "Water — DC Terminal" };

const fmt = new Intl.NumberFormat("en-US");

function numOrNull(v: unknown): number | null {
  return typeof v === "number" ? v : null;
}

export default function WaterPage() {
  const facilities = loadFacilities();
  const k = computeKpis(facilities);
  const context = loadWaterContext();

  const known = facilities.filter((f) =>
    [f.water.withdrawal_mgd, f.water.consumption_mgd, f.water.wue_l_per_kwh].some(
      (cv) => typeof cv.value === "number"
    )
  );

  const withdrawalKnown = known.filter(
    (f) => numOrNull(f.water.withdrawal_mgd.value) !== null
  );
  const withdrawalSum = withdrawalKnown.reduce(
    (acc, f) => acc + (f.water.withdrawal_mgd.value as number),
    0
  );

  return (
    <div className="flex flex-col gap-3 pt-6">
      <h1 className="font-sans text-xl font-semibold tracking-wide">Water</h1>

      <div className="panel-in grid grid-cols-2 rounded-[2px] border border-hairline bg-bg-1 md:grid-cols-3 lg:divide-x lg:divide-hairline">
        <KpiCell
          label="Water coverage"
          value={`${k.water_coverage_pct}%`}
          subline={`${k.water_any_known_count} of ${k.total} facilities with any numeric metric`}
        />
        <KpiCell
          label="Known withdrawal"
          value={`${fmt.format(Math.round(withdrawalSum * 100) / 100)} MGD`}
          subline={`sum across ${withdrawalKnown.length} facilities only`}
        />
        <KpiCell
          label="Unknown"
          value={fmt.format(k.total - k.water_any_known_count)}
          subline="facilities with no public water figure"
        />
      </div>

      <Panel title="The gap, plainly">
        <p className="max-w-3xl text-[13px] text-fg-muted">
          Most data centers do not publish facility-level water figures.{" "}
          {k.total - k.water_any_known_count} of {k.total} facilities in this
          dataset have no public water metric, and we leave them as unknown
          rather than estimating. Sums above cover only the facilities listed
          below — they are not U.S. totals. See{" "}
          <Link href="/methodology" className="underline hover:text-fg">
            methodology
          </Link>{" "}
          for how figures are sourced.
        </p>
      </Panel>

      <Panel title={`Facilities with known water data (${known.length})`}>
        {known.length === 0 ? (
          <div className="py-6 text-center font-mono text-[12px] text-fg-dim">
            None in the current dataset.
          </div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-hairline text-left font-mono text-[10px] uppercase tracking-[0.1em] text-fg-dim">
                <th className="py-1.5 pr-2 font-medium">Facility</th>
                <th className="py-1.5 pr-2 font-medium">St</th>
                <th className="py-1.5 pr-2 text-right font-medium">Withdrawal MGD</th>
                <th className="py-1.5 pr-2 text-right font-medium">Consumption MGD</th>
                <th className="py-1.5 pr-2 text-right font-medium">WUE L/kWh</th>
                <th className="py-1.5 font-medium">Cooling</th>
              </tr>
            </thead>
            <tbody>
              {known.map((f) => (
                <tr key={f.id} className="border-b border-hairline/50 transition-colors hover:bg-bg-2">
                  <td className="py-1.5 pr-2">
                    <Link href={`/facilities/${f.id}`} className="hover:underline">
                      {f.name}
                    </Link>
                  </td>
                  <td className="py-1.5 pr-2 font-mono text-fg-muted">{f.location.state}</td>
                  {(
                    [
                      f.water.withdrawal_mgd,
                      f.water.consumption_mgd,
                      f.water.wue_l_per_kwh,
                    ] as const
                  ).map((cv, i) => (
                    <td key={i} className="py-1.5 pr-2 text-right font-mono tabular-nums">
                      {typeof cv.value === "number" ? (
                        <span>
                          {cv.value}{" "}
                          <ConfidenceBadge confidence={cv.confidence} />
                        </span>
                      ) : (
                        <span className="text-fg-dim">—</span>
                      )}
                    </td>
                  ))}
                  <td className="py-1.5 font-mono text-[11px] text-fg-muted">
                    {f.water.cooling_type.value &&
                    f.water.cooling_type.value !== "unknown"
                      ? f.water.cooling_type.value
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      <Panel title="National context — external estimates (not sums of rows above)">
        <p className="mb-2 max-w-3xl text-[13px] text-fg-muted">
          Literature and agency estimates for scale only. These are independent
          national/cohort figures from the sources cited — they are{" "}
          <span className="text-fg">not</span> derived from, and must not be
          compared as totals of, the facility rows above.
        </p>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-hairline text-left font-mono text-[10px] uppercase tracking-[0.1em] text-fg-dim">
              <th className="py-1.5 pr-2 font-medium">Estimate</th>
              <th className="py-1.5 pr-2 text-right font-medium">Value</th>
              <th className="py-1.5 pr-2 font-medium">Year</th>
              <th className="py-1.5 font-medium">Conf</th>
            </tr>
          </thead>
          <tbody>
            {context.estimates.map((e) => (
              <tr key={e.id} className="border-b border-hairline/50">
                <td className="py-1.5 pr-2 text-fg-muted">{e.label}</td>
                <td className="py-1.5 pr-2 text-right font-mono tabular-nums">
                  {fmt.format(e.value)} {e.unit}
                </td>
                <td className="py-1.5 pr-2 font-mono text-fg-muted">{e.year ?? "—"}</td>
                <td className="py-1.5">
                  <ConfidenceBadge confidence={e.confidence} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
