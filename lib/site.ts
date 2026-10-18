// Public site settings. NEXT_PUBLIC_* values are inlined at build time (static export),
// so set them in the Cloudflare Pages project's environment variables, not at runtime.

export const SITE_NAME = "DC Terminal";

export const SITE_DESCRIPTION =
  "US data center inventory — operating, planned, behind-the-meter power, and water, with sourced data and honest coverage disclosure.";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://dc-terminal.pages.dev"
).replace(/\/+$/, "");

// beehiiv: Grow → Subscribe Forms → (form) → Get embed code → the iframe's full `src`,
// e.g. https://embeds.beehiiv.com/<uuid>?slim=true
export const NEWSLETTER_EMBED_URL = process.env.NEXT_PUBLIC_BEEHIIV_EMBED_URL || "";

// beehiiv hosted subscribe page, used when no embed is set, e.g. https://<publication>.beehiiv.com/subscribe
export const NEWSLETTER_URL = process.env.NEXT_PUBLIC_NEWSLETTER_URL || "";

export const NEWSLETTER_ENABLED = Boolean(NEWSLETTER_EMBED_URL || NEWSLETTER_URL);

// Optional public contact address (sponsorship / data corrections). Hidden when unset.
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "";
