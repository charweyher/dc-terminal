export type Confidence = "confirmed" | "reported" | "estimated" | "unknown";

export interface ConfidentValue<T> {
  value: T | null;
  confidence: Confidence;
  /** IDs from data/sources.json */
  source_ids: string[];
  /** ISO date YYYY-MM-DD */
  as_of: string | null;
}

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
  | "exact"
  | "parcel"
  | "city"
  | "county"
  | "state";

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

export interface Facility {
  id: string;
  name: string;
  aliases: string[];
  operator: string | null;
  developer: string | null;
  facility_type: FacilityType;
  status: FacilityStatus;

  location: {
    lat: ConfidentValue<number>;
    lng: ConfidentValue<number>;
    state: string;
    county: string | null;
    city: string | null;
    precision: LocationPrecision;
  };

  capacity: {
    /** Primary IT / critical load MW used for map sizing & rankings */
    it_load_mw: ConfidentValue<number>;
    critical_load_mw: ConfidentValue<number>;
    year_operational: ConfidentValue<number>;
    expected_year: ConfidentValue<number>;
  };

  power: {
    grid_interconnect: ConfidentValue<GridInterconnect>;
    /** true = on-site generation serves campus (BTM / dedicated) */
    behind_the_meter: ConfidentValue<boolean>;
    onsite_generation_mw: ConfidentValue<number>;
    fuel_types: string[];
  };

  water: {
    withdrawal_mgd: ConfidentValue<number>;
    consumption_mgd: ConfidentValue<number>;
    wue_l_per_kwh: ConfidentValue<number>;
    cooling_type: ConfidentValue<CoolingType>;
  };

  source_ids: string[];
  last_reviewed: string;
  notes: string | null;
}

export interface FacilityDataset {
  version: string;
  generated_at: string;
  description: string;
  facilities: Facility[];
}

export interface Source {
  id: string;
  title: string;
  publisher: string;
  url: string | null;
  accessed_at: string;
  license_notes: string | null;
  kind: "government" | "academic" | "corporate" | "news" | "ngo" | "other";
}

export interface SourceRegistry {
  version: string;
  sources: Source[];
}

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
  water_coverage_pct: number;
}

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
