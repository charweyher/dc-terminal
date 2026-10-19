import { stateOutline, type LocatorPoint } from "@/lib/geo";

/** Server-rendered state outline with facility dots: no map tiles, no client JS. */
export default function LocatorMap({
  state,
  points,
  width = 240,
  height = 170,
  label,
}: {
  state: string;
  points: LocatorPoint[];
  width?: number;
  height?: number;
  label: string;
}) {
  const outline = stateOutline(state, width, height);
  if (!outline) return null;
  // Largest first so small markers stay on top and clickable in tooltips.
  const sorted = [...points].sort((a, b) => b.r - a.r);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
      role="img"
      aria-label={label}
    >
      <path d={outline.path} fill="var(--bg-2)" stroke="var(--border-strong)" strokeWidth={1} />
      {sorted.map((p, i) => {
        const [x, y] = outline.project(p.lng, p.lat);
        return (
          <g key={i} data-tip={p.label}>
            <circle cx={x} cy={y} r={p.r + 6} fill={p.color} opacity={0.14} />
            <circle cx={x} cy={y} r={p.r} fill={p.color} stroke="var(--bg-1)" strokeWidth={2} />
          </g>
        );
      })}
    </svg>
  );
}
