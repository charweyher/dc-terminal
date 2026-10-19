import { PHASE_LABEL, PHASES, type Phase } from "@/lib/rollups";

export const PHASE_FILL: Record<Phase, string> = {
  operating: "bg-chart-operating",
  pipeline: "bg-chart-pipeline",
};

export default function PhaseLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-fg-muted">
      {PHASES.map((p) => (
        <span key={p} className="inline-flex items-center gap-1.5">
          <span className={`inline-block h-2.5 w-2.5 rounded-[2px] ${PHASE_FILL[p]}`} aria-hidden />
          {PHASE_LABEL[p]}
        </span>
      ))}
    </div>
  );
}
