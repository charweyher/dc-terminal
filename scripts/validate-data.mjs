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
  for (const sid of cv.source_ids) {
    if (!sourceIds.has(sid)) {
      errors.push(`${fid}: ${label} references unknown source id "${sid}"`);
    }
  }
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

for (const w of warnings) console.warn(`WARN  ${w}`);
for (const e of errors) console.error(`ERROR ${e}`);

if (errors.length > 0) {
  console.error(`\nValidation failed: ${errors.length} error(s), ${warnings.length} warning(s).`);
  process.exit(1);
}
console.log(`\nValidation passed (${warnings.length} warning(s)).`);
