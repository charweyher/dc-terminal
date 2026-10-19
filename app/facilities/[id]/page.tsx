import Link from "next/link";
import { notFound } from "next/navigation";
import Panel from "@/components/Panel";
import ConfidentField from "@/components/ConfidentField";
import ConfidenceBadge from "@/components/ConfidenceBadge";
import FactsMeter from "@/components/FactsMeter";
import LocatorMap from "@/components/LocatorMap";
import StatusStepper from "@/components/StatusStepper";
import ChartTooltip from "@/components/charts/ChartTooltip";
import { getSourceById, loadFacilities } from "@/lib/data";
import { FACILITY_TYPE_LABEL, markerRadius, phaseColor } from "@/lib/rollups";

const fmt = new Intl.NumberFormat("en-US");
const mw = (v: unknown) => `${fmt.format(v as number)} MW`;
const mgd = (v: unknown) => `${v} MGD`;

export function generateStaticParams() {
  return loadFacilities().map((f) => ({ id: f.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const f = loadFacilities().find((x) => x.id === id);
  return { title: `${f?.name ?? "Facility"} — DC Terminal` };
}

export default async function FacilityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const f = loadFacilities().find((x) => x.id === id);
  if (!f) notFound();

  const sources = [...new Set(f.source_ids)]
    .map((sid) => getSourceById(sid))
    .filter((s) => s !== undefined);

  const itLoad = f.capacity.it_load_mw;
  const hasLoad = typeof itLoad.value === "number";
  const place = [f.location.city, f.location.county && `${f.location.county} County`]
    .filter(Boolean)
    .join(", ");
  const lat = f.location.lat.value;
  const lng = f.location.lng.value;

  return (
    <div className="flex flex-col gap-3 pt-6">
      <section className="panel-in grid gap-4 rounded-[2px] border border-hairline bg-bg-1 p-4 md:grid-cols-[1fr_auto] md:p-5">
        <div className="flex min-w-0 flex-col gap-3">
          <div>
            <h1 className="font-sans text-2xl font-semibold tracking-wide md:text-3xl">{f.name}</h1>
            <p className="mt-1 text-[13px] text-fg-muted">
              {FACILITY_TYPE_LABEL[f.facility_type]} in {place ? `${place}, ` : ""}
              <Link
                href={`/states/${f.location.state.toLowerCase()}`}
                className="underline decoration-hairline-strong underline-offset-2 hover:text-fg"
              >
                {f.location.state}
              </Link>
              {f.operator ? <> · operated by {f.operator}</> : null}
            </p>
            {f.aliases.length > 0 ? (
              <p className="mt-0.5 text-[12px] text-fg-dim">Also known as {f.aliases.join(", ")}</p>
            ) : null}
          </div>
          <StatusStepper status={f.status} />
          <div className="flex flex-wrap items-end gap-x-10 gap-y-4 pt-1">
            <div>
              <div className="text-[12px] text-fg-muted">IT load</div>
              {hasLoad ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-semibold leading-none text-fg">
                    {fmt.format(itLoad.value as number)}
                  </span>
                  <span className="text-lg text-fg-muted">MW</span>
                  <ConfidenceBadge confidence={itLoad.confidence} />
                </div>
              ) : (
                <div className="text-2xl font-semibold leading-tight text-fg-dim">Not public</div>
              )}
            </div>
            <ChartTooltip>
              <FactsMeter facility={f} />
            </ChartTooltip>
          </div>
        </div>
        {typeof lat === "number" && typeof lng === "number" ? (
          <div className="w-full max-w-[260px] self-center justify-self-center md:w-[240px]">
            <LocatorMap
              state={f.location.state}
              points={[
                {
                  lat,
                  lng,
                  r: markerRadius(itLoad.value),
                  color: phaseColor(f),
                  label: f.name,
                },
              ]}
              label={`${f.name} location within ${f.location.state}`}
            />
            <p className="mt-1 text-center text-[11px] text-fg-dim">
              Location precision: {f.location.precision}
            </p>
          </div>
        ) : null}
      </section>

      <div className="grid gap-3 md:grid-cols-2">
        <Panel title="Identity">
          <div className="flex flex-col">
            <div className="flex items-baseline justify-between border-b border-hairline/50 py-1.5">
              <span className="font-sans text-[11px] uppercase tracking-[0.1em] text-fg-muted">Operator</span>
              <span className="font-mono text-[13px]">{f.operator ?? "—"}</span>
            </div>
            <div className="flex items-baseline justify-between border-b border-hairline/50 py-1.5">
              <span className="font-sans text-[11px] uppercase tracking-[0.1em] text-fg-muted">Developer</span>
              <span className="font-mono text-[13px]">{f.developer ?? "—"}</span>
            </div>
            <div className="flex items-baseline justify-between border-b border-hairline/50 py-1.5">
              <span className="font-sans text-[11px] uppercase tracking-[0.1em] text-fg-muted">Location</span>
              <span className="font-mono text-[13px]">
                {[f.location.city, f.location.county, f.location.state]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>
            <div className="flex items-baseline justify-between py-1.5">
              <span className="font-sans text-[11px] uppercase tracking-[0.1em] text-fg-muted">Last reviewed</span>
              <span className="font-mono text-[13px]">{f.last_reviewed}</span>
            </div>
          </div>
        </Panel>

        <Panel title="Coordinates">
          <ConfidentField label="Latitude" cv={f.location.lat} />
          <ConfidentField label="Longitude" cv={f.location.lng} />
          <div className="flex items-baseline justify-between py-1.5">
            <span className="font-sans text-[11px] uppercase tracking-[0.1em] text-fg-muted">Precision</span>
            <span className="font-mono text-[13px]">{f.location.precision}</span>
          </div>
        </Panel>

        <Panel title="Capacity">
          <ConfidentField label="IT load" cv={f.capacity.it_load_mw} format={mw} />
          <ConfidentField label="Critical load" cv={f.capacity.critical_load_mw} format={mw} />
          <ConfidentField label="Year operational" cv={f.capacity.year_operational} />
          <ConfidentField label="Expected year" cv={f.capacity.expected_year} />
        </Panel>

        <Panel title="Power">
          <ConfidentField
            label="Behind-the-meter"
            cv={f.power.behind_the_meter}
            format={(v) => (v ? "yes" : "no")}
          />
          <ConfidentField
            label="Grid interconnect"
            cv={f.power.grid_interconnect}
            format={(v) => String(v).replace(/_/g, " ")}
          />
          <ConfidentField label="On-site generation" cv={f.power.onsite_generation_mw} format={mw} />
          <div className="flex items-baseline justify-between py-1.5">
            <span className="font-sans text-[11px] uppercase tracking-[0.1em] text-fg-muted">Fuel types</span>
            <span className="font-mono text-[13px]">
              {f.power.fuel_types.length > 0
                ? f.power.fuel_types.map((t) => t.replace(/_/g, " ")).join(", ")
                : "—"}
            </span>
          </div>
        </Panel>

        <Panel title="Water" className="md:col-span-2">
          <div className="grid gap-x-8 md:grid-cols-2">
            <div>
              <ConfidentField label="Withdrawal" cv={f.water.withdrawal_mgd} format={mgd} />
              <ConfidentField label="Consumption" cv={f.water.consumption_mgd} format={mgd} />
            </div>
            <div>
              <ConfidentField label="WUE" cv={f.water.wue_l_per_kwh} format={(v) => `${v} L/kWh`} />
              <ConfidentField label="Cooling type" cv={f.water.cooling_type} />
            </div>
          </div>
        </Panel>
      </div>

      {f.notes ? (
        <Panel title="Notes">
          <p className="text-[13px] text-fg-muted">{f.notes}</p>
        </Panel>
      ) : null}

      <Panel title={`Sources (${sources.length})`}>
        <ul className="flex flex-col">
          {sources.map((s) => (
            <li
              key={s.id}
              className="flex flex-wrap items-baseline gap-x-3 border-b border-hairline/50 py-1.5 last:border-b-0"
            >
              {s.url ? (
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-[13px] underline hover:text-fg">
                  {s.title}
                </a>
              ) : (
                <span className="text-[13px]">{s.title}</span>
              )}
              <span className="font-mono text-[11px] text-fg-muted">{s.publisher}</span>
              <span className="font-mono text-[10px] uppercase text-fg-dim">
                {s.kind} · accessed {s.accessed_at}
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      <div className="flex gap-4 font-mono text-[11px] text-fg-muted">
        <Link href="/facilities" className="underline hover:text-fg">← All facilities</Link>
        <Link href="/map" className="underline hover:text-fg">View on map</Link>
      </div>
    </div>
  );
}
