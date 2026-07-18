#!/usr/bin/env node
/**
 * EIA ingest — behind-the-meter (BTM) generation candidates.
 *
 * Pulls operating-generator capacity rows from the EIA Open Data API v2
 * (Form EIA-860M lineage) for the requested states, then flags plants whose
 * names match known data-center operators/campuses. Writes a STAGING file
 * for human curation:
 *
 *   data/raw/eia-btm-candidates.staging.json   (gitignored)
 *
 * A match here is evidence that a generator EXISTS near/at a campus — a
 * curator must still confirm it serves the data center before marking
 * `btm.self_powered` confirmed (cite `eia-860-overview` in sources.json).
 *
 * Requires a free API key: https://www.eia.gov/opendata/register.php
 *
 * Usage:
 *   EIA_API_KEY=xxxx node scripts/ingest/eia-generators.mjs --states TX,GA,TN,VA,LA,OH
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = join(ROOT, "data", "raw", "eia-btm-candidates.staging.json");

const API_KEY = process.env.EIA_API_KEY;
if (!API_KEY) {
  console.error(
    "EIA_API_KEY is not set. Get a free key at https://www.eia.gov/opendata/register.php\n" +
      "Then: EIA_API_KEY=xxxx node scripts/ingest/eia-generators.mjs --states TX,GA"
  );
  process.exit(1);
}

const statesArg = process.argv.indexOf("--states");
const STATES =
  statesArg > -1
    ? process.argv[statesArg + 1].split(",").map((s) => s.trim().toUpperCase())
    : ["TX", "GA", "TN", "VA", "LA", "OH", "AZ", "IA", "NM", "OK", "WA", "NJ"];

// Plant-name patterns that suggest a data-center-adjacent generator.
// Word-boundary regexes — plain substrings match too much (e.g. "xai" hits
// "Praxair", "riot" hits "Patriot Wind"). Curators tune this list.
const PATTERNS = [
  /data\s?cent(er|re)/, /\bcolossus\b/, /\bxai\b/,
  /\bmeta\b/, /\bhyperion\b/,
  /\bgoogle\b/, /\bmicrosoft\b/, /\bfairwater\b/, /\bamazon\b/, /\baws\b/,
  /\bstargate\b/, /\bopenai\b/, /\boracle\b/,
  /vantage data/, /\bqts\b/, /\bequinix\b/, /digital realty/, /\bcyrusone\b/,
  /\biren\b/, /\briot\b/, /\bhut\s?8\b/, /\bcrusoe\b/, /\bfermi\b/,
];

const BASE = "https://api.eia.gov/v2/electricity/operating-generator-capacity/data/";
const PAGE = 5000;

async function fetchState(state) {
  const rows = [];
  for (let offset = 0; ; offset += PAGE) {
    const url = new URL(BASE);
    url.searchParams.set("api_key", API_KEY);
    url.searchParams.set("frequency", "monthly");
    url.searchParams.set("data[0]", "nameplate-capacity-mw");
    url.searchParams.set("facets[stateid][]", state);
    url.searchParams.set("sort[0][column]", "period");
    url.searchParams.set("sort[0][direction]", "desc");
    url.searchParams.set("offset", String(offset));
    url.searchParams.set("length", String(PAGE));
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`  ${state}: HTTP ${res.status} — skipping state`);
      return rows;
    }
    const body = await res.json();
    const page = body?.response?.data ?? [];
    rows.push(...page);
    if (page.length < PAGE) return rows;
  }
}

const matches = [];
for (const state of STATES) {
  process.stdout.write(`Fetching ${state}… `);
  const rows = await fetchState(state);
  // Keep only the latest period per generator.
  const latest = new Map();
  for (const r of rows) {
    const id = `${r.plantid}/${r.generatorid}`;
    if (!latest.has(id)) latest.set(id, r);
  }
  let hit = 0;
  for (const r of latest.values()) {
    const name = (r.plantName ?? "").toLowerCase();
    if (!PATTERNS.some((re) => re.test(name))) continue;
    hit++;
    matches.push({
      state,
      plant_id: r.plantid,
      plant_name: r.plantName,
      generator_id: r.generatorid,
      technology: r.technology ?? null,
      energy_source: r["energy-source-desc"] ?? null,
      nameplate_mw: r["nameplate-capacity-mw"] ?? null,
      status: r.statusDescription ?? r.status ?? null,
      period: r.period,
      county: r.county ?? null,
      lat: r.latitude ?? null,
      lng: r.longitude ?? null,
    });
  }
  console.log(`${latest.size} generators, ${hit} keyword matches`);
}

matches.sort((a, b) => (b.nameplate_mw ?? 0) - (a.nameplate_mw ?? 0));

mkdirSync(join(ROOT, "data", "raw"), { recursive: true });
writeFileSync(
  OUT,
  JSON.stringify(
    {
      source: "EIA Open Data API v2 — operating generator capacity (EIA-860M lineage)",
      license: "U.S. government public data",
      states: STATES,
      patterns: PATTERNS.map(String),
      fetched_at: new Date().toISOString(),
      count: matches.length,
      note: "STAGING ONLY. Keyword match ≠ BTM confirmation — verify the generator serves the campus before citing.",
      candidates: matches,
    },
    null,
    2
  )
);
console.log(`Wrote ${matches.length} candidates → ${OUT}`);
