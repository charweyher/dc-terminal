#!/usr/bin/env node
/**
 * Builds the map's "OSM-reported (unverified)" candidate layer from the
 * Overpass staging file. Unlike facilities.json rows, these are NOT curated:
 * they are raw OpenStreetMap data-centre tags, shown on /map as a dim,
 * toggleable layer and excluded from every KPI.
 *
 *   input:  data/raw/overpass-datacenters.staging.json  (npm run ingest:overpass)
 *   output: public/osm-candidates.geojson               (committed, ODbL)
 *           data/osm-candidates.meta.json               (count + fetch date for UI)
 *
 * Filters applied:
 *   - point-in-polygon against public/us-states.geojson (drops Canada/Mexico
 *     points caught by the ingest bounding boxes) and tags each point's state
 *   - drops candidates within ~1.5 km of a curated facilities.json row so the
 *     layer doesn't double-plot campuses we already cover
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const STAGING = join(ROOT, "data", "raw", "overpass-datacenters.staging.json");
const STATES = join(ROOT, "public", "us-states.geojson");
const FACILITIES = join(ROOT, "data", "facilities.json");
const OUT_GEOJSON = join(ROOT, "public", "osm-candidates.geojson");
const OUT_META = join(ROOT, "data", "osm-candidates.meta.json");

if (!existsSync(STAGING)) {
  console.error(
    `Missing ${STAGING}\nRun \`npm run ingest:overpass\` first to fetch candidates.`
  );
  process.exit(1);
}

const staging = JSON.parse(readFileSync(STAGING, "utf8"));
const states = JSON.parse(readFileSync(STATES, "utf8"));

// Ray-casting point-in-polygon; rings are [lng, lat] pairs.
function inRing(lng, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
    ) {
      inside = !inside;
    }
  }
  return inside;
}

function inPolygon(lng, lat, geometry) {
  const polys =
    geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  for (const poly of polys) {
    if (!inRing(lng, lat, poly[0])) continue;
    // Inside the outer ring — make sure it isn't in a hole.
    if (poly.slice(1).some((hole) => inRing(lng, lat, hole))) continue;
    return true;
  }
  return false;
}

// Precompute state bounding boxes so most point/state pairs skip the ring math.
const stateIndex = states.features.map((f) => {
  let minX = 180, minY = 90, maxX = -180, maxY = -90;
  const polys =
    f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  for (const poly of polys) {
    for (const [x, y] of poly[0]) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  return { code: f.properties.code, geometry: f.geometry, minX, minY, maxX, maxY };
});

function stateOf(lng, lat) {
  for (const s of stateIndex) {
    if (lng < s.minX || lng > s.maxX || lat < s.minY || lat > s.maxY) continue;
    if (inPolygon(lng, lat, s.geometry)) return s.code;
  }
  return null;
}

// Curated coordinates for the ~1.5 km dedupe (0.015° lat ≈ 1.7 km).
const curated = JSON.parse(readFileSync(FACILITIES, "utf8"))
  .facilities.map((f) => ({
    lat: f.location?.lat?.value,
    lng: f.location?.lng?.value,
  }))
  .filter((c) => typeof c.lat === "number" && typeof c.lng === "number");

function nearCurated(lng, lat) {
  return curated.some(
    (c) =>
      Math.abs(c.lat - lat) < 0.015 &&
      Math.abs(c.lng - lng) < 0.015 / Math.cos((lat * Math.PI) / 180)
  );
}

let dropped = { non_us: 0, near_curated: 0 };
const features = [];
for (const c of staging.candidates) {
  const state = stateOf(c.lng, c.lat);
  if (!state) {
    dropped.non_us++;
    continue;
  }
  if (nearCurated(c.lng, c.lat)) {
    dropped.near_curated++;
    continue;
  }
  features.push({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [Math.round(c.lng * 1e5) / 1e5, Math.round(c.lat * 1e5) / 1e5],
    },
    properties: {
      osm_id: c.osm_id,
      name: c.name,
      operator: c.operator,
      state,
    },
  });
}

const meta = {
  count: features.length,
  fetched_at: staging.fetched_at,
  built_at: new Date().toISOString(),
  source_id: "osm-overpass-datacenters",
  license: "ODbL — © OpenStreetMap contributors",
  dropped,
};

writeFileSync(
  OUT_GEOJSON,
  JSON.stringify({
    type: "FeatureCollection",
    metadata: meta,
    features,
  })
);
writeFileSync(OUT_META, JSON.stringify(meta, null, 2) + "\n");
console.log(
  `Wrote ${features.length} US candidates → public/osm-candidates.geojson ` +
    `(dropped ${dropped.non_us} non-US, ${dropped.near_curated} near curated rows)`
);
