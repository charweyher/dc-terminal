import Link from "next/link";
import Panel from "@/components/Panel";
import KpiCell from "@/components/KpiCell";
import NewsletterSignup from "@/components/NewsletterSignup";
import { NEWSLETTER_ENABLED } from "@/lib/site";
import FacilityMap from "@/components/FacilityMap";
import MapLegend from "@/components/MapLegend";
import RankedFacilityTable, {
  rankByKnownMw,
} from "@/components/RankedFacilityTable";
import DataWire from "@/components/DataWire";
import Ledger from "@/components/Ledger";
import ChartTooltip from "@/components/charts/ChartTooltip";
import PhaseBars from "@/components/charts/PhaseBars";
import PhaseLegend from "@/components/charts/PhaseLegend";
import YearColumns from "@/components/charts/YearColumns";
import { loadFacilities } from "@/lib/data";
import { computeKpis } from "@/lib/kpis";
import { toMapData } from "@/lib/mapPoints";
import { countByPhase, FACILITY_TYPE_LABEL, splitTail, yearBins } from "@/lib/rollups";
import { STATE_NAMES } from "@/lib/states";

const fmt = new Intl.NumberFormat("en-US");

export default function Home() {
  const facilities = loadFacilities();
  const k = computeKpis(facilities);
  const mapData = toMapData(facilities);

  const byState = splitTail(
    countByPhase(
      facilities,
      (f) => f.location.state,
      (code) => STATE_NAMES[code] ?? code,
      (code) => `/states/${code.toLowerCase()}`
    )
  );
  const byOperator = splitTail(
    countByPhase(facilities, (f) => f.operator ?? "Undisclosed")
  );
  const byType = countByPhase(
    facilities,
    (f) => f.facility_type,
    (t) => FACILITY_TYPE_LABEL[t as keyof typeof FACILITY_TYPE_LABEL] ?? t
  );
  const years = yearBins(facilities, new Date().getUTCFullYear());
  const active = k.total - k.cancelled;
  const topOperating = rankByKnownMw(
    facilities.filter((f) => f.status === "operating"),
    5
  );
  const topPlanned = rankByKnownMw(
    facilities.filter(
      (f) => f.status === "planned" || f.status === "under_construction"
    ),
    5
  );

  const kpiCells = [
    {
      label: "Facilities in dataset",
      value: fmt.format(k.total),
      subline: "curated inventory · not a census",
      href: "/methodology",
    },
    { label: "Operating", value: fmt.format(k.operating) },
    {
      label: "Planned",
      value: fmt.format(k.planned),
      subline: `+${k.under_construction} under construction`,
    },
    {
      label: "Operating MW (known)",
      value: fmt.format(k.operating_mw_sum),
      subline: `MW known for ${k.operating_mw_known_count} of ${k.operating} operating`,
    },
    {
      label: "Planned MW (known)",
      value: fmt.format(k.planned_mw_sum),
      subline: `incl. under construction · ${k.planned_mw_known_count} of ${
        k.planned + k.under_construction
      } known`,
    },
    {
      label: "Behind-the-meter",
      value: `${k.btm_confirmed_count} conf · ${k.btm_reported_count} rpt`,
      subline: `${fmt.format(k.btm_confirmed_mw)} MW conf · ${fmt.format(
        k.btm_reported_mw
      )} MW rpt · of ${k.total - k.cancelled} non-cancelled`,
      href: "/behind-the-meter",
    },
    {
      label: "Water coverage",
      value: `${k.water_coverage_pct}%`,
      subline: `${k.water_any_known_count} of ${k.total} with any water metric`,
      href: "/water",
    },
  ];

  return (
    <div className="flex flex-col gap-3 pt-8">
      <div className="panel-in">
        <h1 className="font-sans text-4xl font-bold tracking-[0.06em]">
          DC TERMINAL
        </h1>
        <p className="mt-2 max-w-2xl text-fg-muted">
          US data center inventory — operating, planned, on-site power, and
          water, built from public sources with honest coverage disclosure.
        </p>
      </div>

      <div className="panel-in grid grid-cols-2 rounded-[2px] border border-hairline bg-bg-1 md:grid-cols-4 lg:grid-cols-7 lg:divide-x lg:divide-hairline">
        {kpiCells.map((kpi) => (
          <KpiCell key={kpi.label} {...kpi} />
        ))}
      </div>

      {NEWSLETTER_ENABLED ? (
        <Panel>
          <NewsletterSignup />
        </Panel>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Panel title="US Map">
          <div className="flex flex-col gap-2">
            <FacilityMap points={mapData.points} heightClass="h-[460px]" cooperativeGestures />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <MapLegend unmappedCount={mapData.unmappedCount} />
              <Link
                href="/map"
                className="font-mono text-[11px] text-fg-muted underline hover:text-fg"
              >
                Open full map + filters →
              </Link>
            </div>
          </div>
        </Panel>
        <Panel title="Data wire">
          <DataWire limit={5} />
        </Panel>
      </div>

      <Panel title="Breakdown">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <PhaseLegend />
            <span className="text-[12px] text-fg-dim">
              {active} active facilities
              {k.cancelled > 0 ? ` · ${k.cancelled} cancelled project excluded` : ""}
            </span>
          </div>
          <ChartTooltip className="grid gap-x-10 gap-y-6 md:grid-cols-2">
            <section>
              <h2 className="text-[13px] font-medium text-fg">Where they are</h2>
              <p className="mb-2 text-[12px] text-fg-dim">States with two or more facilities</p>
              <PhaseBars rows={byState.head} caption="Facilities by state, operating vs pipeline" />
              {byState.tail.length > 0 ? (
                <p className="mt-2 text-[12px] text-fg-dim">
                  One each in{" "}
                  {byState.tail.map((r, i) => (
                    <span key={r.key}>
                      {i > 0 ? ", " : ""}
                      <Link href={r.href ?? "#"} className="text-fg-muted hover:text-fg hover:underline">
                        {r.label}
                      </Link>
                    </span>
                  ))}
                  .
                </p>
              ) : null}
            </section>
            <section>
              <h2 className="text-[13px] font-medium text-fg">Who runs them</h2>
              <p className="mb-2 text-[12px] text-fg-dim">Operators with two or more facilities</p>
              <PhaseBars rows={byOperator.head} caption="Facilities by operator, operating vs pipeline" />
              {byOperator.tail.length > 0 ? (
                <p className="mt-2 text-[12px] text-fg-dim">
                  {byOperator.tail.length} more operators run one facility each:{" "}
                  <span className="text-fg-muted">
                    {byOperator.tail.map((r) => r.label).join(", ")}
                  </span>
                  .
                </p>
              ) : null}
            </section>
            <section>
              <h2 className="text-[13px] font-medium text-fg">What they&apos;re for</h2>
              <p className="mb-2 text-[12px] text-fg-dim">Facilities by type</p>
              <PhaseBars rows={byType} caption="Facilities by type, operating vs pipeline" />
            </section>
            <section>
              <h2 className="text-[13px] font-medium text-fg">When they come online</h2>
              <p className="mb-2 text-[12px] text-fg-dim">
                Year online for {years.operatingKnown} of {years.operatingTotal} operating · expected
                year for {years.pipelineKnown} of {years.pipelineTotal} in the pipeline
              </p>
              <YearColumns bins={years.bins} caption="Facilities by year online or expected" />
            </section>
          </ChartTooltip>
        </div>
      </Panel>

      <Panel title="Source ledger">
        <Ledger facilities={facilities} />
      </Panel>

      <div className="grid gap-3 md:grid-cols-2">
        <Panel title="Largest Operating (known MW)">
          <RankedFacilityTable facilities={topOperating} />
        </Panel>
        <Panel title="Largest Planned + Under Construction (known MW)">
          <RankedFacilityTable facilities={topPlanned} />
        </Panel>
      </div>
    </div>
  );
}
