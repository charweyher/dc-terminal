import Link from "next/link";

export default function KpiCell({
  label,
  value,
  subline,
  href,
}: {
  label: string;
  value: string;
  subline?: string;
  href?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1 px-4 py-3">
      <div className="font-sans text-[10px] uppercase tracking-[0.12em] text-fg-muted">
        {label}
      </div>
      <div className="font-mono text-2xl font-semibold tabular-nums text-fg">
        {value}
      </div>
      {subline ? (
        href ? (
          <Link
            href={href}
            className="truncate font-mono text-[11px] text-fg-dim underline decoration-hairline-strong underline-offset-2 hover:text-fg-muted"
          >
            {subline}
          </Link>
        ) : (
          <div className="truncate font-mono text-[11px] text-fg-dim">
            {subline}
          </div>
        )
      ) : null}
    </div>
  );
}
