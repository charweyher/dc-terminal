import fs from "node:fs";
import path from "node:path";
import type {
  Facility,
  FacilityDataset,
  SourceRegistry,
  Source,
  WaterAggregateContext,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf8")) as T;
}

let datasetCache: FacilityDataset | null = null;
let sourcesCache: SourceRegistry | null = null;
let waterContextCache: WaterAggregateContext | null = null;

/** Curated inventory; falls back to the schema fixture if it doesn't exist. */
export function loadDataset(): FacilityDataset {
  if (!datasetCache) {
    const curated = path.join(DATA_DIR, "facilities.json");
    datasetCache = readJson<FacilityDataset>(
      fs.existsSync(curated) ? "facilities.json" : "facilities.sample.json"
    );
  }
  return datasetCache;
}

export function loadFacilities(): Facility[] {
  return loadDataset().facilities;
}

export function loadSources(): SourceRegistry {
  if (!sourcesCache) {
    sourcesCache = readJson<SourceRegistry>("sources.json");
  }
  return sourcesCache;
}

export function getSourceById(id: string): Source | undefined {
  return loadSources().sources.find((s) => s.id === id);
}

export function loadWaterContext(): WaterAggregateContext {
  if (!waterContextCache) {
    waterContextCache = readJson<WaterAggregateContext>("aggregates.water.json");
  }
  return waterContextCache;
}
