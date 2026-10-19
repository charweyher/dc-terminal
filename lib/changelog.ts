import fs from "node:fs";
import path from "node:path";

export interface ChangelogEntry {
  version: string;
  date: string;
  headline: string;
  changeCount: number;
}

/** Strip the markdown CHANGELOG_DATA.md uses (bold, code, links) down to plain text. */
function plain(md: string): string {
  return md
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:(—-]+$/, "")}…`;
}

/**
 * Newest-first entries parsed from CHANGELOG_DATA.md: "## <version> — <date>", an optional
 * "> " plain-language summary (preferred as the headline), then top-level "- " bullets.
 */
export function loadChangelog(limit = 5): ChangelogEntry[] {
  const md = fs.readFileSync(path.join(process.cwd(), "CHANGELOG_DATA.md"), "utf8");
  const entries: ChangelogEntry[] = [];
  for (const block of md.split(/^## /m).slice(1)) {
    const [header, ...lines] = block.split("\n");
    const m = header.match(/^(\S+)\s+[—-]\s+(\d{4}-\d{2}-\d{2})/);
    if (!m) continue;
    const summary = lines.find((l) => l.startsWith("> "));
    const bullets = lines.filter((l) => /^- /.test(l)).map((l) => plain(l.slice(2)));
    if (bullets.length === 0 && !summary) continue;
    entries.push({
      version: m[1],
      date: m[2],
      headline: clip(summary ? plain(summary.slice(2)) : bullets[0], 160),
      changeCount: bullets.length,
    });
  }
  return entries.reverse().slice(0, limit);
}
