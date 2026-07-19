import Link from "next/link";
import Panel from "@/components/Panel";
import { loadFacilities, loadSources } from "@/lib/data";
import { computeKpis } from "@/lib/kpis";

export const metadata = { title: "Data Centers 101 — DC Terminal" };

function Term({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <li>
      <span className="font-mono text-[12px] text-fg">{name}</span>{" "}
      <span className="text-fg-muted">— {children}</span>
    </li>
  );
}

export default function LearnPage() {
  const facilities = loadFacilities();
  const k = computeKpis(facilities);
  const lbnl = loadSources().sources.find((s) => s.id === "lbnl-dc-energy-2024");

  return (
    <div className="flex flex-col gap-3 pt-6">
      <h1 className="font-sans text-xl font-semibold tracking-wide">
        Data Centers 101
      </h1>
      <p className="max-w-3xl text-[13px] text-fg-muted">
        A plain-language primer on US data centers — what they are, why so many
        are being built, what they contribute, and what they ask of the places
        that host them. No hype in either direction.
      </p>

      <Panel title="What is a data center?">
        <div className="max-w-3xl space-y-2 text-[13px] text-fg-muted">
          <p>
            A data center is a building full of computers — thousands to
            hundreds of thousands of servers — plus the electrical and cooling
            systems that keep them running around the clock. Every search,
            video stream, hospital record, payment, weather forecast, and AI
            chat runs through one. The &quot;cloud&quot; is not abstract: it is
            these buildings.
          </p>
          <p>
            They range from small enterprise server rooms to{" "}
            <span className="text-fg">hyperscale campuses</span> — sites like
            the Google, Meta, and Microsoft facilities in this dataset that
            draw as much power as a mid-sized city and anchor a region&apos;s
            digital economy.
          </p>
        </div>
      </Panel>

      <Panel title="Why the boom?">
        <div className="max-w-3xl space-y-2 text-[13px] text-fg-muted">
          <p>
            Two waves stacked on top of each other. First, a decade of cloud
            migration: companies moved computing from their own closets into
            large, far more efficient shared facilities. Second, since ~2023,
            AI: training and running large models takes orders of magnitude
            more computing per task, and the new AI campuses (xAI Colossus,
            Stargate Abilene, Galaxy Helios in this dataset) are built at
            gigawatt scale — a size that simply didn&apos;t exist before.
          </p>
          <p>
            Lawrence Berkeley National Laboratory estimates data centers used
            about 4.4% of US electricity in 2023 and could reach roughly 7–12%
            by 2028
            {lbnl?.url ? (
              <>
                {" "}
                (<a href={lbnl.url} className="underline hover:text-fg">
                  LBNL 2024 report
                </a>)
              </>
            ) : null}
            . That growth is why siting, power, and water have become national
            conversations.
          </p>
        </div>
      </Panel>

      <Panel title="What they contribute">
        <ul className="max-w-3xl list-disc space-y-1.5 pl-5 text-[13px] text-fg-muted">
          <li>
            <span className="text-fg">The services themselves.</span> Cloud
            computing, streaming, telemedicine, logistics, science, and AI all
            run on this infrastructure — reliable digital services require
            physical buildings somewhere.
          </li>
          <li>
            <span className="text-fg">Construction and skilled jobs.</span>{" "}
            Large campuses employ thousands of trades workers for years during
            buildout, plus permanent technicians, electricians, and operations
            staff.
          </li>
          <li>
            <span className="text-fg">Local tax base.</span> Data centers are
            among the highest-value property-tax payers per acre of land used,
            often funding schools and services in rural counties — with little
            added traffic or school enrollment.
          </li>
          <li>
            <span className="text-fg">Infrastructure investment.</span>{" "}
            Operators frequently fund grid upgrades, substations, water
            reclamation, and fiber that outlast any single tenant. Several
            (like Galaxy Helios) reuse stranded industrial sites and
            already-built power interconnections.
          </li>
          <li>
            <span className="text-fg">Efficiency.</span> Consolidating
            computing into modern facilities is far more energy-efficient than
            the scattered server rooms it replaced.
          </li>
        </ul>
      </Panel>

      <Panel title="What they ask of a place">
        <ul className="max-w-3xl list-disc space-y-1.5 pl-5 text-[13px] text-fg-muted">
          <li>
            <span className="text-fg">Electricity.</span> The defining demand.
            A single AI campus can request more power than a city, straining
            grids and interconnection queues — which is why some builders turn
            to on-site generation (see{" "}
            <Link href="/behind-the-meter" className="underline hover:text-fg">
              behind-the-meter
            </Link>
            ).
          </li>
          <li>
            <span className="text-fg">Water — sometimes.</span> Evaporative
            cooling can use millions of gallons a day; air-cooled and
            closed-loop designs use very little. It depends on the design and
            climate, which is why we report only published figures (see{" "}
            <Link href="/water" className="underline hover:text-fg">
              water
            </Link>
            ).
          </li>
          <li>
            <span className="text-fg">Land, noise, and emissions.</span>{" "}
            Campuses occupy hundreds of acres; backup generators and on-site
            turbines require air permits and produce local emissions.
          </li>
          <li>
            <span className="text-fg">Uncertainty.</span> Announced projects
            don&apos;t always happen — this dataset tracks a real cancellation
            (Microsoft&apos;s Licking County, OH plans) alongside operating
            sites, because both are part of the honest picture.
          </li>
        </ul>
      </Panel>

      <Panel title="Key terms">
        <ul className="max-w-3xl space-y-1.5 text-[13px]">
          <Term name="MW (megawatt)">
            a million watts of power. Data centers are sized by power, not
            square feet — a 100 MW facility uses roughly as much electricity as
            80,000 homes.
          </Term>
          <Term name="IT load / critical load">
            the power that actually reaches the servers, excluding cooling and
            overhead. The most honest single size metric.
          </Term>
          <Term name="hyperscale">
            a campus built and operated by one giant (Google, Meta, Microsoft,
            Amazon) for its own services.
          </Term>
          <Term name="colocation">
            a facility that rents space and power to many tenants (Equinix,
            Digital Realty, QTS).
          </Term>
          <Term name="behind-the-meter (BTM)">
            power generated on site rather than drawn from the grid.
          </Term>
          <Term name="WUE">
            water use effectiveness — liters of water per kWh of IT energy;
            lower is better.
          </Term>
          <Term name="interconnection queue">
            the multi-year regulatory line a large project waits in before it
            may connect to the grid — the main reason builders chase
            speed-to-power alternatives.
          </Term>
        </ul>
      </Panel>

      <Panel title="How to read this site">
        <div className="max-w-3xl space-y-2 text-[13px] text-fg-muted">
          <p>
            We track {k.total} curated facilities ({k.operating} operating) and
            show ~1,550 additional unverified OSM-reported sites as gray dots
            on the{" "}
            <Link href="/map" className="underline hover:text-fg">
              map
            </Link>
            . Every number on a curated row carries a confidence badge:{" "}
            <span className="font-mono text-[11px]">confirmed</span> (primary
            documents), <span className="font-mono text-[11px]">reported</span>{" "}
            (credible press or company statements),{" "}
            <span className="font-mono text-[11px]">estimated</span>, or{" "}
            <span className="font-mono text-[11px]">unknown</span> — and
            unknown means we show a dash instead of inventing a number.
          </p>
          <p>
            Start with the{" "}
            <Link href="/map" className="underline hover:text-fg">
              map
            </Link>{" "}
            or the{" "}
            <Link href="/facilities" className="underline hover:text-fg">
              facilities table
            </Link>
            , dig into{" "}
            <Link href="/behind-the-meter" className="underline hover:text-fg">
              behind-the-meter power
            </Link>{" "}
            and{" "}
            <Link href="/water" className="underline hover:text-fg">
              water
            </Link>
            , and check the{" "}
            <Link href="/methodology" className="underline hover:text-fg">
              methodology
            </Link>{" "}
            for exactly where every number comes from.
          </p>
        </div>
      </Panel>
    </div>
  );
}
