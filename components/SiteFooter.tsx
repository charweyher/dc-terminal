import Link from "next/link";
import NewsletterSignup from "@/components/NewsletterSignup";
import { CONTACT_EMAIL } from "@/lib/site";

export default function SiteFooter() {
  return (
    <footer className="border-t border-hairline bg-bg-1">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-6">
        <NewsletterSignup />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-fg-dim">
          <span>DC TERMINAL · built from public sources</span>
          <Link href="/methodology" className="hover:text-fg">
            Methodology &amp; sources
          </Link>
          <Link href="/learn" className="hover:text-fg">
            Data Centers 101
          </Link>
          {CONTACT_EMAIL ? (
            <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-fg">
              Contact / corrections
            </a>
          ) : null}
          <span className="ml-auto">
            Curated inventory, not a census · not affiliated with any operator
          </span>
        </div>
      </div>
    </footer>
  );
}
