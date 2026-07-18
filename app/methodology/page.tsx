import Link from "next/link";
import Panel from "@/components/Panel";
import ConfidenceBadge from "@/components/ConfidenceBadge";
import { loadDataset, loadSources } from "@/lib/data";
import type { Confidence } from "@/lib/types";

export const metadata = { title: "Methodology — DC Terminal" };

const CONFIDENCE_ROWS: Array<{ level: Confidence; meaning: string }> = [
  {
    level: "confirmed",
    meaning:
      "Primary document: permit, EIA filing, company SEC/sustainability disclosure naming the site, official government map.",
  },
  {
    level: "reported",
    meaning:
      "Credible secondary journalism or industry press citing the named project; not independently verified in this repo.",
  },
  {
    level: "estimated",
    meaning:
      "Derived value — e.g. geocode from a city name, or MW inferred from phase announcements.",
  },
  {
    level: "unknown",
    meaning: "No usable public evidence. The value is null and shown as a dash.",
  },
];

export default function MethodologyPage() {
  const dataset = loadDataset();
  const registry = loadSources();
  const byKind = new Map<string, number>();
  for (const s of registry.sources) {
    byKind.set(s.kind, (byKind.get(s.kind) ?? 0) + 1);
  }

  return (
    <div className="flex flex-col gap-3 pt-6">
      <h1 className="font-sans text-xl font-semibold tracking-wide">
        Methodology
      </h1>

      <Panel title="What this dataset is — and is not">
        <div className="max-w-3xl space-y-2 text-[13px] text-fg-muted">
          <p>
            DC Terminal is a <span className="text-fg">public aggregation</span>:
            every facility row is curated by hand from government filings,
            corporate disclosures, academic work, and named journalism, with a
            per-field confidence level and source citations. Dataset version{" "}
            <span className="font-mono">{dataset.version}</span> currently holds{" "}
            {dataset.facilities.length} facilities.
          </p>
          <p>
            It is <span className="text-fg">not a complete national census</span>.
            Commercial trackers list far more projects than this inventory.
            Counts and MW sums on this site describe the curated dataset only,
            and every sensitive KPI carries a coverage subline saying so.
          </p>
          <p>
            We do not scrape or copy proprietary inventories (including
            Cleanview&apos;s facility database, which we reference only as a
            layout inspiration, or paywalled datasets), and we do not invent
            coordinates, MW, or water figures. Unknown means unknown.
          </p>
        </div>
      </Panel>

      <Panel title="Confidence levels">
        <table className="w-full text-[13px]">
          <tbody>
            {CONFIDENCE_ROWS.map((row) => (
              <tr key={row.level} className="border-b border-hairline/50 last:border-b-0">
                <td className="w-20 py-2 align-top">
                  <ConfidenceBadge confidence={row.level} />
                </td>
                <td className="py-2 text-fg-muted">{row.meaning}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-[12px] text-fg-dim">
          Every capacity, BTM, water, and coordinate field is wrapped in this
          model with its own sources and as-of date — visible on each facility
          page.
        </p>
      </Panel>

      <Panel title="Pipeline">
        <ol className="max-w-3xl list-decimal space-y-1 pl-5 text-[13px] text-fg-muted">
          <li>Identify a facility in an allowed public source class (government filings, corporate primary documents, academic/national-lab work, reputable journalism, OpenStreetMap).</li>
          <li>Create or update the facility record; wrap capacity, BTM, water, and coordinates in the confidence model.</li>
          <li>Register new sources in the registry; every claim cites source IDs.</li>
          <li>Run the schema validator (unique IDs, USPS states, coordinate bounds, unknown⇒null, source references, BTM consistency).</li>
          <li>Log the change in the data changelog and bump the dataset version.</li>
        </ol>
        <p className="mt-2 text-[12px] text-fg-dim">
          EIA plant data is never auto-joined to data centers: any EIA ↔ campus
          match requires human review, with the rationale recorded on the
          facility notes.
        </p>
      </Panel>

      <Panel title={`Source registry (${registry.sources.length})`}>
        <p className="mb-2 font-mono text-[11px] text-fg-dim">
          {[...byKind.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([kind, n]) => `${kind} ${n}`)
            .join(" · ")}
        </p>
        <ul className="flex flex-col">
          {registry.sources.map((s) => (
            <li
              key={s.id}
              className="flex flex-wrap items-baseline gap-x-3 border-b border-hairline/50 py-1.5 last:border-b-0"
            >
              {s.url ? (
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] underline hover:text-fg"
                >
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

      <Panel title="Known gaps">
        <ul className="max-w-3xl list-disc space-y-1 pl-5 text-[13px] text-fg-muted">
          <li>Facility-level water figures are rare; most rows are honestly unknown — see <Link href="/water" className="underline hover:text-fg">water</Link>.</li>
          <li>BTM status is unverified for many sites; confirmed vs reported are never merged — see <Link href="/behind-the-meter" className="underline hover:text-fg">behind-the-meter</Link>.</li>
          <li>Some coordinates are city-precision geocodes, marked as such on the map and facility pages.</li>
          <li>The sample-seeded inventory includes clearly labeled synthetic fixture rows pending replacement with filing-backed records.</li>
        </ul>
      </Panel>
    </div>
  );
}
