import {
  NEWSLETTER_EMBED_URL,
  NEWSLETTER_ENABLED,
  NEWSLETTER_URL,
} from "@/lib/site";

// Renders nothing until a beehiiv embed or subscribe URL is configured.
export default function NewsletterSignup() {
  if (!NEWSLETTER_ENABLED) return null;

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-planned">
          Weekly brief
        </div>
        <p className="mt-1 max-w-xl text-fg">
          New and planned US data centers, on-site power, and water — once a
          week, every number sourced.
        </p>
      </div>
      {NEWSLETTER_EMBED_URL ? (
        <iframe
          src={NEWSLETTER_EMBED_URL}
          title="Subscribe to the DC Terminal weekly brief"
          height={52}
          scrolling="no"
          className="w-full max-w-md border-0 bg-transparent"
        />
      ) : (
        <a
          href={NEWSLETTER_URL}
          target="_blank"
          rel="noopener"
          className="inline-block rounded-[2px] border border-hairline-strong px-4 py-2 font-mono text-[12px] text-fg hover:bg-bg-2"
        >
          Subscribe →
        </a>
      )}
    </div>
  );
}
