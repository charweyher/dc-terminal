export default function Panel({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`panel-in rounded-[2px] border border-hairline bg-bg-1 ${className}`}
    >
      {title ? (
        <div className="border-b border-hairline px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-fg-muted">
          {title}
        </div>
      ) : null}
      <div className="p-3">{children}</div>
    </section>
  );
}
