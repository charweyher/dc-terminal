#!/usr/bin/env node
/**
 * Overpass (OpenStreetMap) ingest — US data-center candidates.
 *
 * Queries the public Overpass API for features tagged as data centres in the
 * United States and writes a STAGING file for human curation:
 *
 *   data/raw/overpass-datacenters.staging.json   (gitignored)
 *
 * This script never writes data/facilities.json. Per docs/DATA_PIPELINE.md,
 * a curator promotes staged candidates by hand, wrapping fields in the
 * confidence model and citing `osm-overpass-datacenters` in sources.json.
 *
 * License: OSM data is ODbL — attribution required ("© OpenStreetMap
 * contributors"); coordinates/names derived from OSM keep that lineage.
 *
 * Usage:  node scripts/ingest/overpass-datacenters.mjs [--endpoint URL]
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = join(ROOT, "data", "raw", "overpass-datacenters.staging.json");

const endpointArg = process.argv.indexOf("--endpoint");
const ENDPOINTS =
  endpointArg > -1
    ? [process.argv[endpointArg + 1]]
    : [
        "https://overpass-api.de/api/interpreter",
        "https://overpass.kumi.systems/api/interpreter",
      ];

// Bounding boxes (south,west,north,east) are far cheaper for Overpass than an
// admin-area lookup, which times out when the servers are busy.
// CONUS + Alaska + Hawaii.
const BBOXES = [
  "24.0,-125.5,49.6,-66.3",
  "51.0,-180.0,72.5,-129.0",
  "18.5,-161.0,22.5,-154.5",
];

// Both spellings appear in the wild; `nwr` covers nodes, ways, relations.
const QUERY = `
[out:json][timeout:300];
(
${BBOXES.map(
  (b) => `  nwr["telecom"="data_center"](${b});
  nwr["telecom"="data_centre"](${b});
  nwr["building"="data_center"](${b});
  nwr["building"="data_centre"](${b});`
).join("\n")}
);
out center tags;
`;

function centerOf(el) {
  if (el.type === "node") return { lat: el.lat, lng: el.lon };
  if (el.center) return { lat: el.center.lat, lng: el.center.lon };
  return null;
}

let payload = null;
for (const endpoint of ENDPOINTS) {
  console.log(`Querying Overpass (${endpoint}) for US data-center tags…`);
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "dc-terminal-ingest/0.1 (public data aggregation)",
      },
      body: "data=" + encodeURIComponent(QUERY),
    });
    if (!res.ok) {
      console.error(`  HTTP ${res.status} ${res.statusText} — trying next mirror`);
      continue;
    }
    const text = await res.text();
    try {
      payload = JSON.parse(text);
      break;
    } catch {
      // Busy servers return an HTML error page with status 200.
      console.error("  Server returned non-JSON (busy) — trying next mirror");
    }
  } catch (err) {
    console.error(`  ${err.message} — trying next mirror`);
  }
}
if (!payload) {
  console.error("All Overpass endpoints failed; try again later.");
  process.exit(1);
}

const seen = new Set();
const candidates = [];
for (const el of payload.elements ?? []) {
  const key = `${el.type}/${el.id}`;
  if (seen.has(key)) continue;
  seen.add(key);
  const c = centerOf(el);
  if (!c) continue;
  const t = el.tags ?? {};
  candidates.push({
    osm_id: key,
    name: t.name ?? null,
    operator: t.operator ?? null,
    lat: Math.round(c.lat * 1e5) / 1e5,
    lng: Math.round(c.lng * 1e5) / 1e5,
    state_hint: t["addr:state"] ?? null,
    city_hint: t["addr:city"] ?? null,
    tags: {
      telecom: t.telecom ?? null,
      building: t.building ?? null,
      website: t.website ?? null,
      ref: t.ref ?? null,
    },
  });
}

candidates.sort((a, b) => (a.name ?? "~").localeCompare(b.name ?? "~"));

mkdirSync(join(ROOT, "data", "raw"), { recursive: true });
writeFileSync(
  OUT,
  JSON.stringify(
    {
      source: "OpenStreetMap via Overpass API",
      license: "ODbL — © OpenStreetMap contributors",
      query_tags: ["telecom=data_center", "building=data_center"],
      fetched_at: new Date().toISOString(),
      count: candidates.length,
      note: "STAGING ONLY. Curate by hand into data/facilities.json per docs/DATA_PIPELINE.md; never bulk-import.",
      candidates,
    },
    null,
    2
  )
);
console.log(`Wrote ${candidates.length} candidates → ${OUT}`);
console.log(`Named: ${candidates.filter((c) => c.name).length} · with operator: ${candidates.filter((c) => c.operator).length}`);
