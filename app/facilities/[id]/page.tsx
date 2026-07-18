import Link from "next/link";
import { notFound } from "next/navigation";
import Panel from "@/components/Panel";
import ConfidentField from "@/components/ConfidentField";
import { getSourceById, loadFacilities } from "@/lib/data";

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

  return (
    <div className="flex flex-col gap-3 pt-6">
      <div className="flex flex-wrap items-baseline gap-3">
        <h1 className="font-sans text-xl font-semibold tracking-wide">
          {f.name}
        </h1>
        <span className="font-mono text-[12px] text-fg-muted">
          {f.status.replace("_", " ")} · {f.facility_type.replace("_", " ")} ·{" "}
          <Link href={`/states/${f.location.state.toLowerCase()}`} className="underline hover:text-fg">
            {f.location.state}
          </Link>
        </span>
      </div>
      {f.aliases.length > 0 ? (
        <div className="font-mono text-[11px] text-fg-dim">
          aka {f.aliases.join(" · ")}
        </div>
      ) : null}

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
