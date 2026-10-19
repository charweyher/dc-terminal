import Link from "next/link";
import { PHASE_LABEL, PHASES, type PhaseRow } from "@/lib/rollups";
import { PHASE_FILL } from "@/components/charts/PhaseLegend";

/**
 * Horizontal bars, one per row, split into operating | pipeline segments.
 * Marks: 12px bars from one baseline, 2px surface gap between segments,
 * 4px rounded data-end only; the row total sits at the bar tip in text ink.
 */
export default function PhaseBars({
  rows,
  caption,
}: {
  rows: PhaseRow[];
  /** Plain-language summary for screen readers. */
  caption: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.total));

  return (
    <figure>
      <div className="flex flex-col gap-1.5" aria-hidden>
        {rows.map((row) => {
          const segments = PHASES.filter((p) => row.counts[p] > 0);
          const label = (
            <span className="truncate text-[12px] text-fg-muted group-hover:text-fg">
              {row.label}
            </span>
          );
          return (
            <div key={row.key} className="group grid grid-cols-[7.5rem_1fr] items-center gap-2">
              {row.href ? (
                <Link href={row.href} tabIndex={-1} className="truncate">
                  {label}
                </Link>
              ) : (
                label
              )}
              <div className="flex items-center gap-2 border-l border-hairline pl-px">
                <div
                  className="flex h-3 gap-[2px]"
                  style={{ width: `${(row.total / max) * 85}%` }}
                >
                  {segments.map((p, i) => (
                    <div
                      key={p}
                      data-tip={`${row.label}\n${PHASE_LABEL[p]}: ${row.counts[p]}`}
                      className={`h-full ${PHASE_FILL[p]} ${
                        i === segments.length - 1 ? "rounded-r-[4px]" : ""
                      }`}
                      style={{ flexGrow: row.counts[p], flexBasis: 0 }}
                    />
                  ))}
                </div>
                <span className="font-mono text-[11px] tabular-nums text-fg-muted">
                  {row.total}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <table className="sr-only">
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th>Group</th>
            {PHASES.map((p) => (
              <th key={p}>{PHASE_LABEL[p]}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}>
              <td>{r.label}</td>
              {PHASES.map((p) => (
                <td key={p}>{r.counts[p]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
