// Validates data/facilities.json against docs/DATA_SCHEMA.md rules.
// Exits non-zero on errors; inconsistent BTM/interconnect combos are warnings.
import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");

const USPS = new Set([
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC","PR","GU","VI","AS","MP",
]);

const CONFIDENCES = new Set(["confirmed", "reported", "estimated", "unknown"]);
const STATUSES = new Set(["operating", "planned", "under_construction", "cancelled"]);
const PRECISIONS = new Set(["exact", "parcel", "city", "county", "state"]);
const FACILITY_TYPES = new Set(["hyperscale", "colocation", "enterprise", "crypto_mining", "ai_campus", "other"]);

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf8"));
}

const sourceIds = new Set(readJson("sources.json").sources.map((s) => s.id));

const errors = [];
const warnings = [];

function checkConfidentValue(cv, label, fid) {
  if (cv == null || typeof cv !== "object") {
    errors.push(`${fid}: ${label} is not a ConfidentValue object`);
    return;
  }
  if (!CONFIDENCES.has(cv.confidence)) {
    errors.push(`${fid}: ${label} has invalid confidence "${cv.confidence}"`);
  }
  if (cv.confidence === "unknown" && cv.value !== null && cv.value !== "unknown") {
    errors.push(`${fid}: ${label} confidence=unknown but value=${JSON.stringify(cv.value)}`);
  }
  if (!Array.isArray(cv.source_ids)) {
    errors.push(`${fid}: ${label}.source_ids is not an array`);
    return;
  }
  // Provenance rule: any asserted value must cite at least one source.
  if (cv.confidence !== "unknown" && cv.value !== null && cv.source_ids.length === 0) {
    errors.push(`${fid}: ${label} asserts a value with no source_ids`);
  }
  for (const sid of cv.source_ids) {
    if (!sourceIds.has(sid)) {
      errors.push(`${fid}: ${label} references unknown source id "${sid}"`);
    }
  }
}

// --- Geographic cross-check: coordinates must fall inside the claimed state.
// Reuses the map's state polygons; catches transposed digits, wrong-state
// rows, and lat/lng swaps (the Meta Hyperion class of error).
const statesGeo = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "public", "us-states.geojson"), "utf8")
);

function inRing(lng, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function stateContains(code, lng, lat) {
  const feat = statesGeo.features.find((f) => f.properties.code === code);
  if (!feat) return null; // territory without polygon — cannot check
  const polys =
    feat.geometry.type === "Polygon"
      ? [feat.geometry.coordinates]
      : feat.geometry.coordinates;
  return polys.some(
    (poly) =>
      inRing(lng, lat, poly[0]) &&
      !poly.slice(1).some((hole) => inRing(lng, lat, hole))
  );
}

function validateFile(file) {
  const dataset = readJson(file);
  const facilities = dataset.facilities ?? [];
  const seen = new Set();

  for (const f of facilities) {
    const fid = `${file} → ${f.id ?? "<missing id>"}`;

    if (!f.id) errors.push(`${fid}: missing id`);
    else if (seen.has(f.id)) errors.push(`${fid}: duplicate id`);
    seen.add(f.id);

    if (!STATUSES.has(f.status)) errors.push(`${fid}: invalid status "${f.status}"`);
    if (!USPS.has(f.location?.state)) {
      errors.push(`${fid}: invalid state "${f.location?.state}"`);
    }
    if (!PRECISIONS.has(f.location?.precision)) {
      errors.push(`${fid}: invalid location precision "${f.location?.precision}"`);
    }
    if (!FACILITY_TYPES.has(f.facility_type)) {
      errors.push(`${fid}: invalid facility_type "${f.facility_type}"`);
    }

    const lat = f.location?.lat;
    const lng = f.location?.lng;
    if (lat?.value !== null && (lat?.value < -90 || lat?.value > 90)) {
      errors.push(`${fid}: lat ${lat?.value} out of range`);
    }
    if (lng?.value !== null && (lng?.value < -180 || lng?.value > 180)) {
      errors.push(`${fid}: lng ${lng?.value} out of range`);
    }

    checkConfidentValue(lat, "location.lat", fid);
    checkConfidentValue(lng, "location.lng", fid);
    for (const k of ["it_load_mw", "critical_load_mw", "year_operational", "expected_year"]) {
      checkConfidentValue(f.capacity?.[k], `capacity.${k}`, fid);
    }
    for (const k of ["grid_interconnect", "behind_the_meter", "onsite_generation_mw"]) {
      checkConfidentValue(f.power?.[k], `power.${k}`, fid);
    }
    for (const k of ["withdrawal_mgd", "consumption_mgd", "wue_l_per_kwh", "cooling_type"]) {
      checkConfidentValue(f.water?.[k], `water.${k}`, fid);
    }

    for (const sid of f.source_ids ?? []) {
      if (!sourceIds.has(sid)) {
        errors.push(`${fid}: facility source_ids references unknown source "${sid}"`);
      }
    }

    if (
      f.power?.behind_the_meter?.value === true &&
      !["behind_the_meter", "hybrid"].includes(f.power?.grid_interconnect?.value)
    ) {
      warnings.push(
        `${fid}: behind_the_meter=true but grid_interconnect=${JSON.stringify(
          f.power?.grid_interconnect?.value
        )}`
      );
    }

    // Coordinates must fall inside the claimed state. Coarse precisions get a
    // warning (centroids can drift over borders); exact/parcel are errors.
    if (typeof lat?.value === "number" && typeof lng?.value === "number") {
      const inside = stateContains(f.location.state, lng.value, lat.value);
      if (inside === false) {
        const msg = `${fid}: coordinates (${lat.value}, ${lng.value}) fall outside claimed state ${f.location.state}`;
        if (["exact", "parcel"].includes(f.location?.precision)) errors.push(msg);
        else warnings.push(msg);
      }
    }
  }

  // Duplicate detection: two rows within ~1 km are probably the same campus.
  const located = facilities.filter(
    (f) =>
      typeof f.location?.lat?.value === "number" &&
      typeof f.location?.lng?.value === "number"
  );
  for (let i = 0; i < located.length; i++) {
    for (let j = i + 1; j < located.length; j++) {
      const a = located[i], b = located[j];
      const dLat = Math.abs(a.location.lat.value - b.location.lat.value);
      const dLng = Math.abs(a.location.lng.value - b.location.lng.value);
      if (dLat < 0.01 && dLng < 0.012) {
        warnings.push(
          `${file} → ${a.id} and ${b.id} are within ~1 km of each other — same campus?`
        );
      }
    }
  }

  const counts = {
    operating: facilities.filter((f) => f.status === "operating").length,
    planned: facilities.filter((f) => f.status === "planned").length,
    under_construction: facilities.filter((f) => f.status === "under_construction").length,
    cancelled: facilities.filter((f) => f.status === "cancelled").length,
    btm_confirmed: facilities.filter(
      (f) =>
        f.status !== "cancelled" &&
        f.power?.behind_the_meter?.value === true &&
        f.power?.behind_the_meter?.confidence === "confirmed"
    ).length,
    water_known: facilities.filter((f) =>
      ["withdrawal_mgd", "consumption_mgd", "wue_l_per_kwh"].some(
        (k) => typeof f.water?.[k]?.value === "number"
      )
    ).length,
  };
  console.log(`${file}: ${facilities.length} facilities`, counts);
}

validateFile("facilities.json");

// meta.json must agree with the dataset it describes.
const meta = readJson("meta.json");
const actualCount = readJson("facilities.json").facilities.length;
if (meta.facility_count !== actualCount) {
  errors.push(
    `meta.json: facility_count=${meta.facility_count} but facilities.json has ${actualCount} rows — bump data/meta.json`
  );
}

// Every registered source must actually be cited somewhere (dead entries rot).
// Citations live in facility rows and the national water-context aggregates.
const ALLOW_UNCITED = new Set([
  "census-state-boundaries", // provenance of public/us-states.geojson (map layer)
  "pudl-eia860", // documented future feed (docs/DATA_SOURCES.md)
]);
const cited = new Set();
const walk = (o) => {
  if (o && typeof o === "object") {
    if (Array.isArray(o.source_ids)) o.source_ids.forEach((s) => cited.add(s));
    Object.values(o).forEach(walk);
  }
};
walk(readJson("facilities.json").facilities);
walk(readJson("aggregates.water.json"));
for (const sid of sourceIds) {
  if (!cited.has(sid) && !ALLOW_UNCITED.has(sid)) {
    warnings.push(`sources.json: "${sid}" is registered but never cited`);
  }
}

for (const w of warnings) console.warn(`WARN  ${w}`);
for (const e of errors) console.error(`ERROR ${e}`);

if (errors.length > 0) {
  console.error(`\nValidation failed: ${errors.length} error(s), ${warnings.length} warning(s).`);
  process.exit(1);
}
console.log(`\nValidation passed (${warnings.length} warning(s)).`);
