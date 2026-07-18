# Data Schema — DC Terminal

TypeScript-oriented schema for facilities and confidence-wrapped fields. Implement these types in `src/lib/types.ts` (or equivalent) during Phase 2.

---

## Confidence model

```ts
export type Confidence = "confirmed" | "reported" | "estimated" | "unknown";

export interface ConfidentValue<T> {
  value: T | null;
  confidence: Confidence;
  /** IDs from data/sources.json */
  source_ids: string[];
  /** ISO date YYYY-MM-DD */
  as_of: string | null;
}
```

| Confidence | Meaning |
|------------|---------|
| `confirmed` | Primary document: permit, EIA filing, company SEC/sustainability disclosure naming the site, official gov map |
| `reported` | Credible secondary journalism or industry press citing named project; not independently verified in-repo |
| `estimated` | Derived (e.g. geocode from city, MW inferred from phase announcements) |
| `unknown` | No usable public evidence; `value` should be `null` |

**Rule:** If `confidence === "unknown"`, `value` must be `null`.

---

## Enums

```ts
export type FacilityStatus =
  | "operating"
  | "planned"
  | "under_construction"
  | "cancelled";

export type FacilityType =
  | "hyperscale"
  | "colocation"
  | "enterprise"
  | "crypto_mining"
  | "ai_campus"
  | "other";

export type LocationPrecision =
  | "exact"      // surveyed / filing coordinates
  | "parcel"     // site / campus centroid
  | "city"       // city centroid
  | "county"     // county centroid
  | "state";     // should be rare; prefer better

export type CoolingType =
  | "evaporative"
  | "air"
  | "liquid"
  | "hybrid"
  | "unknown"
  | "other";

export type GridInterconnect =
  | "grid"
  | "behind_the_meter"
  | "hybrid"
  | "unknown";
```

---

## Facility

```ts
export interface Facility {
  id: string; // stable slug, e.g. "xai-colossus-1-tn"
  name: string;
  aliases: string[];
  operator: string | null;
  developer: string | null;
  facility_type: FacilityType;
  status: FacilityStatus;

  location: {
    lat: ConfidentValue<number>;
    lng: ConfidentValue<number>;
    state: string; // USPS 2-letter
    county: string | null;
    city: string | null;
    precision: LocationPrecision;
  };

  capacity: {
    /** Primary IT / critical load MW used for map sizing & rankings */
    it_load_mw: ConfidentValue<number>;
    critical_load_mw: ConfidentValue<number>;
    year_operational: ConfidentValue<number>; // year or null
    expected_year: ConfidentValue<number>;    // for planned
  };

  power: {
    grid_interconnect: ConfidentValue<GridInterconnect>;
    /** true = on-site generation serves campus (BTM / dedicated) */
    behind_the_meter: ConfidentValue<boolean>;
    onsite_generation_mw: ConfidentValue<number>;
    fuel_types: string[]; // e.g. ["natural_gas", "solar"]
  };

  water: {
    withdrawal_mgd: ConfidentValue<number>; // million gallons / day
    consumption_mgd: ConfidentValue<number>;
    wue_l_per_kwh: ConfidentValue<number>;
    cooling_type: ConfidentValue<CoolingType>;
  };

  source_ids: string[]; // union of sources used on this facility
  last_reviewed: string; // YYYY-MM-DD
  notes: string | null;
}
```

### Dataset wrapper

```ts
export interface FacilityDataset {
  version: string;
  generated_at: string; // ISO datetime
  description: string;
  facilities: Facility[];
}
```

Store curated inventory as `data/facilities.json` matching `FacilityDataset`.  
Keep `data/facilities.sample.json` as the fixture used in CI/dev until the curated file exists.

---

## Sources registry

`data/sources.json`:

```ts
export interface Source {
  id: string;
  title: string;
  publisher: string;
  url: string | null;
  accessed_at: string; // YYYY-MM-DD
  license_notes: string | null;
  kind:
    | "government"
    | "academic"
    | "corporate"
    | "news"
    | "ngo"
    | "other";
}

export interface SourceRegistry {
  version: string;
  sources: Source[];
}
```

---

## KPI aggregate shape

Compute in code from facilities; do not hardcode headline KPIs.

```ts
export interface DatasetKpis {
  total: number;
  operating: number;
  planned: number;
  under_construction: number;
  cancelled: number;

  operating_mw_sum: number;
  operating_mw_known_count: number;
  planned_mw_sum: number;
  planned_mw_known_count: number;

  btm_confirmed_count: number;
  btm_confirmed_mw: number;
  btm_reported_count: number;
  btm_reported_mw: number;
  btm_unknown_among_operating: number;

  water_any_known_count: number;
  water_coverage_pct: number; // 0–100
}
```

BTM MW should prefer `onsite_generation_mw` when present; else fall back to `it_load_mw` only if notes say generation matches load — otherwise leave MW null in rankings and exclude from MW sums.

---

## Optional national water context

`data/aggregates.water.json` — literature/national estimates for context panels only:

```ts
export interface WaterAggregateContext {
  version: string;
  notes: string;
  estimates: Array<{
    id: string;
    label: string;
    value: number;
    unit: string;
    year: number | null;
    source_ids: string[];
    confidence: Confidence;
  }>;
}
```

Never mix these into facility-row sums without labeling them as external estimates.

---

## Validation rules (Phase 2 script)

1. Unique `id` across facilities.  
2. `state` is valid USPS code.  
3. Lat in [-90,90], lng in [-180,180] when value non-null.  
4. `unknown` ⇒ `value === null`.  
5. Every `source_ids` entry exists in `sources.json`.  
6. Status `cancelled` facilities excluded from operating/planned KPI counts (may still appear in table with filter).  
7. `behind_the_meter.value === true` should usually have `grid_interconnect` of `behind_the_meter` or `hybrid` (warn if inconsistent).
