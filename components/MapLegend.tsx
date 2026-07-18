const ITEMS = [
  { color: "#3b82f6", label: "Operating" },
  { color: "#f59e0b", label: "Planned" },
  { color: "#fcd34d", label: "Under construction" },
];

export default function MapLegend({ unmappedCount = 0 }: { unmappedCount?: number }) {
  return (
    <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] text-fg-muted">
      {ITEMS.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: item.color }}
          />
          {item.label}
        </span>
      ))}
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-2.5 w-2.5 rounded-full border-2 border-btm" />
        BTM on-site power
      </span>
      <span className="text-fg-dim">Radius ∝ √MW · min radius = MW unknown</span>
      {unmappedCount > 0 ? (
        <span className="text-fg-dim">{unmappedCount} unmapped (no coordinates)</span>
      ) : null}
    </div>
  );
}
