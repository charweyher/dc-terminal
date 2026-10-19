import { PHASE_LABEL, PHASES, type YearBin } from "@/lib/rollups";
import { PHASE_FILL } from "@/components/charts/PhaseLegend";

const PLOT_H = 120; // px for the tallest column

/**
 * Columns by year bucket: operating facilities by year online, pipeline by expected year.
 * Each cap carries its count (every column is labeled, so no y-axis); a solid
 * hairline marks today between the past and future buckets.
 */
export default function YearColumns({ bins, caption }: { bins: YearBin[]; caption: string }) {
  const max = Math.max(1, ...bins.map((b) => b.counts.operating + b.counts.pipeline));
  const todayIndex = bins.findIndex((b) => b.future);

  return (
    <figure>
      <div className="flex items-end gap-1" style={{ height: PLOT_H + 20 }} aria-hidden>
        {bins.map((bin, i) => {
          const total = bin.counts.operating + bin.counts.pipeline;
          const segments = PHASES.filter((p) => bin.counts[p] > 0).reverse(); // pipeline on top
          return (
            <div key={bin.label} className="relative flex h-full flex-1 flex-col items-center justify-end">
              {i === todayIndex ? (
                <div className="absolute -left-0.5 top-0 bottom-0 border-l border-hairline-strong">
                  <span className="absolute -top-0.5 left-1 font-mono text-[10px] text-fg-dim">today</span>
                </div>
              ) : null}
              <span className="mb-1 font-mono text-[11px] tabular-nums text-fg-muted">
                {total > 0 ? total : ""}
              </span>
              <div
                className="flex w-full max-w-6 flex-col gap-[2px]"
                style={{ height: total > 0 ? (total / max) * PLOT_H : 0 }}
              >
                {segments.map((p, j) => (
                  <div
                    key={p}
                    data-tip={`${bin.label}\n${PHASE_LABEL[p]}: ${bin.counts[p]}`}
                    className={`w-full ${PHASE_FILL[p]} ${j === 0 ? "rounded-t-[4px]" : ""}`}
                    style={{ flexGrow: bin.counts[p], flexBasis: 0 }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex gap-1 border-t border-hairline pt-1" aria-hidden>
        {bins.map((bin) => (
          <span key={bin.label} className="flex-1 whitespace-nowrap text-center font-mono text-[10px] text-fg-dim">
            {bin.label}
          </span>
        ))}
      </div>
      <table className="sr-only">
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th>Years</th>
            {PHASES.map((p) => (
              <th key={p}>{PHASE_LABEL[p]}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bins.map((b) => (
            <tr key={b.label}>
              <td>{b.label}</td>
              {PHASES.map((p) => (
                <td key={p}>{b.counts[p]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
