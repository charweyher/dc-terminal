import fs from "node:fs";
import path from "node:path";

type Ring = number[][];
type StateFeature = {
  properties: { name: string; code: string };
  geometry: { type: "Polygon"; coordinates: Ring[] } | { type: "MultiPolygon"; coordinates: Ring[][] };
};

let statesCache: StateFeature[] | null = null;

function loadStates(): StateFeature[] {
  if (!statesCache) {
    const file = path.join(process.cwd(), "public", "us-states.geojson");
    statesCache = (JSON.parse(fs.readFileSync(file, "utf8")) as { features: StateFeature[] }).features;
  }
  return statesCache;
}

export interface LocatorPoint {
  lat: number;
  lng: number;
  /** Marker radius in px. */
  r: number;
  color: string;
  label: string;
}

export interface StateOutline {
  width: number;
  height: number;
  path: string;
  project: (lng: number, lat: number) => [number, number];
}

/**
 * Fit one state's outline into a width×height box with an equirectangular projection
 * scaled by cos(mid-latitude): accurate enough at state scale, and needs no map library.
 * Alaska's Aleutians cross the antimeridian, so positive longitudes are shifted west.
 */
export function stateOutline(code: string, width: number, height: number, pad = 8): StateOutline | null {
  const feature = loadStates().find((s) => s.properties.code === code.toUpperCase());
  if (!feature) return null;

  const polygons: Ring[][] =
    feature.geometry.type === "Polygon" ? [feature.geometry.coordinates] : feature.geometry.coordinates;
  const norm = (lng: number) => (lng > 0 ? lng - 360 : lng);

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const poly of polygons)
    for (const [lng, lat] of poly[0]) {
      const x = norm(lng);
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, lat); maxY = Math.max(maxY, lat);
    }

  const k = Math.cos((((minY + maxY) / 2) * Math.PI) / 180);
  const spanX = (maxX - minX) * k;
  const spanY = maxY - minY;
  const scale = Math.min((width - pad * 2) / spanX, (height - pad * 2) / spanY);
  const offX = (width - spanX * scale) / 2;
  const offY = (height - spanY * scale) / 2;

  const project = (lng: number, lat: number): [number, number] => [
    offX + (norm(lng) - minX) * k * scale,
    offY + (maxY - lat) * scale,
  ];

  const d = polygons
    .flatMap((poly) =>
      poly.map(
        (ring) =>
          ring
            .map(([lng, lat], i) => {
              const [x, y] = project(lng, lat);
              return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
            })
            .join("") + "Z"
      )
    )
    .join("");

  return { width, height, path: d, project };
}
