"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { MapPoint } from "@/lib/mapPoints";

// Free dark basemap: CARTO "Dark Matter" GL style over OpenStreetMap data.
// No API key required; attribution to OSM + CARTO is mandatory and is
// rendered by MapLibre's attribution control from the style metadata.
const STYLE_URL =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

// US Census cartographic state boundaries (public domain), preprocessed with
// USPS codes into public/. Drawn above the basemap so the US reads as a
// crisp silhouette at national zoom; the fill fades out as you zoom in.
const STATES_URL = "/us-states.geojson";
const STATE_LABELS_URL = "/us-state-labels.geojson";

// Continental US framing. Alaska/Hawaii stay reachable by panning.
const CONUS_BOUNDS: [[number, number], [number, number]] = [
  [-125.5, 24.2],
  [-66.3, 49.6],
];
const MAX_BOUNDS: [[number, number], [number, number]] = [
  [-179.9, 14.0],
  [-49.0, 72.5],
];

const STATUS_COLORS: Record<string, string> = {
  operating: "#3b82f6",
  planned: "#f59e0b",
  under_construction: "#fcd34d",
};

function toGeoJson(points: MapPoint[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: points.map((p) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [p.lng, p.lat] },
      properties: { ...p },
    })),
  };
}

export default function FacilityMap({
  points,
  heightClass = "h-[560px]",
  interactive = true,
}: {
  points: MapPoint[];
  heightClass?: string;
  interactive?: boolean;
}) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const loadedRef = useRef(false);
  const pointsRef = useRef(points);
  pointsRef.current = points;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      bounds: CONUS_BOUNDS,
      fitBoundsOptions: { padding: 24 },
      maxBounds: MAX_BOUNDS,
      renderWorldCopies: false,
      interactive,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    if (interactive) {
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }));
    }

    map.on("load", () => {
      loadedRef.current = true;

      map.addSource("us-states", {
        type: "geojson",
        data: STATES_URL,
        promoteId: "code",
      });
      map.addSource("us-state-labels", {
        type: "geojson",
        data: STATE_LABELS_URL,
      });

      // Land fill: strong at national zoom (US silhouette vs ocean),
      // fades out so basemap roads/cities show through when zoomed in.
      map.addLayer({
        id: "states-fill",
        type: "fill",
        source: "us-states",
        paint: {
          "fill-color": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            "#1b2634",
            "#12181f",
          ],
          "fill-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            4.5, 0.9,
            6.5, 0,
          ],
        },
      });
      map.addLayer({
        id: "states-line",
        type: "line",
        source: "us-states",
        paint: {
          "line-color": "#3a4d63",
          "line-width": ["interpolate", ["linear"], ["zoom"], 3, 0.6, 7, 1.2],
          "line-opacity": 0.9,
        },
      });
      map.addLayer({
        id: "state-labels",
        type: "symbol",
        source: "us-state-labels",
        maxzoom: 6.5,
        layout: {
          "text-field": ["get", "code"],
          "text-font": ["Montserrat Medium", "Open Sans Bold", "Noto Sans Regular"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 3, 10, 6, 13],
          "text-letter-spacing": 0.15,
        },
        paint: {
          "text-color": "#5c6b7e",
          "text-halo-color": "#0a0c0f",
          "text-halo-width": 1,
        },
      });

      map.addSource("facilities", {
        type: "geojson",
        data: toGeoJson(pointsRef.current),
      });
      map.addLayer({
        id: "facility-circles",
        type: "circle",
        source: "facilities",
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["sqrt", ["coalesce", ["get", "mw"], 0]],
            0, 4,      // unknown MW → minimum radius
            10, 6,     // 100 MW
            32, 13,    // ~1 GW
            60, 22,    // ~3.6 GW
          ],
          "circle-color": [
            "match",
            ["get", "status"],
            "operating", STATUS_COLORS.operating,
            "planned", STATUS_COLORS.planned,
            "under_construction", STATUS_COLORS.under_construction,
            "#5c6b7e",
          ],
          "circle-opacity": 0.8,
          "circle-stroke-width": [
            "case",
            ["==", ["get", "btm"], true],
            2,
            1,
          ],
          "circle-stroke-color": [
            "case",
            ["==", ["get", "btm"], true],
            "#22c55e",
            "#0a0c0f",
          ],
        },
      });

      if (interactive) {
        let hoveredState: string | null = null;

        map.on("click", "facility-circles", (e) => {
          const feat = e.features?.[0];
          if (!feat) return;
          const p = feat.properties as Record<string, string>;
          const mw = p.mw && p.mw !== "null" ? `${p.mw} MW` : "MW unknown";
          new maplibregl.Popup({ closeButton: false, maxWidth: "260px" })
            .setLngLat(e.lngLat)
            .setHTML(
              `<div style="font-family:var(--mono);font-size:12px;background:#0e1218;color:#e6edf5;padding:8px 10px;border:1px solid #243041">
                <a href="/facilities/${p.id}" style="color:#e6edf5;font-weight:600;text-decoration:underline">${p.name}</a>
                <div style="color:#8b9bb0;margin-top:4px">${p.status} · ${p.state} · ${mw}</div>
                <div style="color:#5c6b7e;margin-top:2px">location precision: ${p.precision}</div>
              </div>`
            )
            .addTo(map);
        });
        map.on("mouseenter", "facility-circles", () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "facility-circles", () => {
          map.getCanvas().style.cursor = "";
        });

        // State drill-down: hover highlight + click (when not on a facility).
        map.on("mousemove", "states-fill", (e) => {
          const code = e.features?.[0]?.id as string | undefined;
          if (code === hoveredState) return;
          if (hoveredState) {
            map.setFeatureState(
              { source: "us-states", id: hoveredState },
              { hover: false }
            );
          }
          hoveredState = code ?? null;
          if (hoveredState) {
            map.setFeatureState(
              { source: "us-states", id: hoveredState },
              { hover: true }
            );
          }
        });
        map.on("mouseleave", "states-fill", () => {
          if (hoveredState) {
            map.setFeatureState(
              { source: "us-states", id: hoveredState },
              { hover: false }
            );
            hoveredState = null;
          }
        });
        map.on("click", "states-fill", (e) => {
          const onFacility = map.queryRenderedFeatures(e.point, {
            layers: ["facility-circles"],
          });
          if (onFacility.length > 0) return;
          const code = e.features?.[0]?.id as string | undefined;
          if (code) router.push(`/states/${code.toLowerCase()}`);
        });
      }
    });

    return () => {
      loadedRef.current = false;
      map.remove();
      mapRef.current = null;
    };
  }, [interactive, router]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    const source = map.getSource("facilities") as
      | maplibregl.GeoJSONSource
      | undefined;
    source?.setData(toGeoJson(points));
  }, [points]);

  return <div ref={containerRef} className={`w-full ${heightClass}`} />;
}
