import { loadChangelog } from "@/lib/changelog";

const day = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

/** Recent dataset releases from CHANGELOG_DATA.md, newest first. */
export default function DataWire({ limit = 5 }: { limit?: number }) {
  const entries = loadChangelog(limit);

  return (
    <ol className="flex flex-col">
      {entries.map((e, i) => (
        <li
          key={e.version}
          className={`relative border-l py-2.5 pl-4 ${i === 0 ? "border-chart-operating" : "border-hairline"}`}
        >
          <span
            className={`absolute -left-[4.5px] top-[15px] h-2 w-2 rounded-full ring-2 ring-bg-1 ${
              i === 0 ? "bg-chart-operating" : "bg-hairline-strong"
            }`}
            aria-hidden
          />
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-[12px] font-medium text-fg">Dataset {e.version}</span>
            <time dateTime={e.date} className="font-mono text-[11px] text-fg-dim">
              {day.format(new Date(`${e.date}T00:00:00Z`))}
            </time>
          </div>
          <p className="mt-1 text-[12px] leading-relaxed text-fg-muted">{e.headline}</p>
          {e.changeCount > 0 ? (
            <p className="mt-0.5 text-[11px] text-fg-dim">
              {e.changeCount} change{e.changeCount > 1 ? "s" : ""} in this release
            </p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
