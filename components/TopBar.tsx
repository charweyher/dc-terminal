import Link from "next/link";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/learn", label: "Learn" },
  { href: "/map", label: "Map" },
  { href: "/facilities", label: "Facilities" },
  { href: "/behind-the-meter", label: "BTM" },
  { href: "/water", label: "Water" },
  { href: "/methodology", label: "Methodology" },
];

export default function TopBar() {
  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-bg-0/95 backdrop-blur-sm">
      <div className="mx-auto flex h-12 max-w-[1440px] items-center gap-6 px-4">
        <Link
          href="/"
          className="font-sans text-[15px] font-bold tracking-[0.08em] text-fg"
        >
          DC&nbsp;TERMINAL
        </Link>
        <nav className="flex items-center gap-1 font-mono text-[12px]">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-2 py-1 text-fg-muted transition-colors hover:bg-bg-2 hover:text-fg"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto font-mono text-[11px] text-fg-dim">
          US DATA CENTER INTELLIGENCE
        </div>
      </div>
    </header>
  );
}
