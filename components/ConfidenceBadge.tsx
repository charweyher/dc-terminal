import type { Confidence } from "@/lib/types";

const LABELS: Record<Confidence, string> = {
  confirmed: "CONF",
  reported: "RPT",
  estimated: "EST",
  unknown: "UNK",
};

// Same one-hue ramp as the ledger, so status colors (blue/amber/green) keep a single meaning.
const COLORS: Record<Confidence, string> = {
  confirmed: "text-conf-confirmed border-conf-confirmed/70",
  reported: "text-conf-reported border-conf-reported/70",
  estimated: "text-fg-muted border-conf-estimated",
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
