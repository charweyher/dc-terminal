import type { Confidence } from "@/lib/types";

const LABELS: Record<Confidence, string> = {
  confirmed: "CONF",
  reported: "RPT",
  estimated: "EST",
  unknown: "UNK",
};

const COLORS: Record<Confidence, string> = {
  confirmed: "text-btm border-btm/50",
  reported: "text-operating border-operating/50",
  estimated: "text-planned border-planned/50",
  unknown: "text-fg-dim border-hairline",
};

export default function ConfidenceBadge({
  confidence,
}: {
  confidence: Confidence;
}) {
  return (
    <span
      className={`inline-block rounded-[2px] border px-1 py-px font-mono text-[9px] leading-tight tracking-wider ${COLORS[confidence]}`}
      title={`confidence: ${confidence}`}
    >
      {LABELS[confidence]}
    </span>
  );
}
