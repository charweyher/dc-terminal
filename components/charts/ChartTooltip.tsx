"use client";

import { useRef, useState } from "react";

/**
 * Hover/focus layer for server-rendered charts: any descendant with a `data-tip`
 * attribute ("line 1\nline 2") shows a tooltip near the pointer, or under the
 * element when it receives keyboard focus.
 */
export default function ChartTooltip({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<{ lines: string[]; x: number; y: number } | null>(null);

  function show(target: EventTarget | null, x?: number, y?: number) {
    const el = (target as HTMLElement | null)?.closest<HTMLElement>("[data-tip]");
    const root = box.current;
    if (!el || !root || !root.contains(el)) return setTip(null);
    const r = root.getBoundingClientRect();
    if (x === undefined || y === undefined) {
      const e = el.getBoundingClientRect();
      x = e.left + e.width / 2;
      y = e.bottom;
    }
    setTip({ lines: (el.dataset.tip ?? "").split("\n"), x: x - r.left, y: y - r.top });
  }

  const width = box.current?.clientWidth ?? 0;
  const flip = tip !== null && tip.x > width - 200;

  return (
    <div
      ref={box}
      className={`relative ${className}`}
      onPointerMove={(e) => show(e.target, e.clientX, e.clientY)}
      onPointerLeave={() => setTip(null)}
      onFocus={(e) => show(e.target)}
      onBlur={() => setTip(null)}
    >
      {children}
      {tip ? (
        <div
          role="tooltip"
          className="pointer-events-none absolute z-20 whitespace-nowrap rounded-[2px] border border-hairline-strong bg-bg-2 px-2 py-1 shadow-lg shadow-black/40"
          style={{
            left: tip.x,
            top: tip.y + 14,
            transform: flip ? "translateX(calc(-100% - 8px))" : "translateX(8px)",
          }}
        >
          {tip.lines.map((line, i) => (
            <div
              key={i}
              className={
                i === 0
                  ? "text-[12px] font-medium text-fg"
                  : "font-mono text-[11px] text-fg-muted"
              }
            >
              {line}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
