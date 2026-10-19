import { factConfidence, LEDGER_FIELDS } from "@/lib/rollups";
import type { Facility } from "@/lib/types";

/** One facility's column of the ledger, laid flat: the same cells, the same confidence ramp. */
export default function FactsMeter({ facility }: { facility: Facility }) {
  const cells = LEDGER_FIELDS.map((field) => ({
    field,
    confidence: factConfidence(field.get(facility)),
  }));
  const known = cells.filter((c) => c.confidence !== "unknown").length;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-[3px]">
        {cells.map((c) => (
          <span
            key={c.field.key}
            className="ledger-cell block"
            data-c={c.confidence}
            data-tip={`${c.field.label}\n${c.confidence === "unknown" ? "not public" : c.confidence}`}
            style={{ width: 22, height: 8 }}
          />
        ))}
      </div>
      <span className="text-[12px] text-fg-muted">
        {known} of {cells.length} key facts sourced
      </span>
    </div>
  );
}
