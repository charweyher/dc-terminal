import Link from "next/link";
import Panel from "@/components/Panel";
import KpiCell from "@/components/KpiCell";
import FacilityMap from "@/components/FacilityMap";
import MapLegend from "@/components/MapLegend";
import RankedFacilityTable, {
  rankByKnownMw,
} from "@/components/RankedFacilityTable";
import { loadFacilities } from "@/lib/data";
import { computeKpis } from "@/lib/kpis";
import { toMapData } from "@/lib/mapPoints";

const fmt = new Intl.NumberFormat("en-US");

export default function Home() {
  const facilities = loadFacilities();
  const k = computeKpis(facilities);
  const mapData = toMapData(facilities);
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

      <Panel title="US Map">
        <div className="flex flex-col gap-2">
          <FacilityMap points={mapData.points} heightClass="h-[420px]" />
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
