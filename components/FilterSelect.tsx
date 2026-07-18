"use client";

export const CONTROL_CLASS =
  "rounded-[2px] border border-hairline bg-bg-2 px-2 py-1 font-mono text-[12px] text-fg outline-none focus:border-hairline-strong";

export default function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="font-mono text-[11px] uppercase text-fg-dim">
      {label}
      <select
        className={`ml-1.5 ${CONTROL_CLASS}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
