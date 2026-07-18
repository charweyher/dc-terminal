import ConfidenceBadge from "./ConfidenceBadge";
import type { ConfidentValue } from "@/lib/types";

export default function ConfidentField({
  label,
  cv,
  format = (v) => String(v),
}: {
  label: string;
  cv: ConfidentValue<unknown>;
  format?: (value: unknown) => string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-hairline/50 py-1.5">
      <span className="font-sans text-[11px] uppercase tracking-[0.1em] text-fg-muted">
        {label}
      </span>
      <span className="flex items-baseline gap-2">
        <span className="font-mono text-[13px] tabular-nums">
          {cv.value === null || cv.value === "unknown" ? (
            <span className="text-fg-dim">—</span>
          ) : (
            format(cv.value)
          )}
        </span>
        <ConfidenceBadge confidence={cv.confidence} />
        {cv.as_of ? (
          <span className="font-mono text-[10px] text-fg-dim">{cv.as_of}</span>
        ) : null}
      </span>
    </div>
  );
}
