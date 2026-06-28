import DottedMap from "dotted-map/without-countries";
import type { MapData } from "dotted-map/without-countries";
import mapData from "@/lib/world-map-data.json";

// The world dot-grid is expensive-ish to instantiate and never changes, so it's
// built once per page load and shared by every map on the page (hero map,
// per-flight-card mini maps, etc.) instead of each component recomputing it.
let sharedMap: InstanceType<typeof DottedMap> | null = null;
const sharedDotsSVG: Record<string, string> = {};

export function getWorldMap() {
  if (!sharedMap) sharedMap = new DottedMap({ map: mapData as unknown as MapData });
  return sharedMap;
}

// `fit` controls preserveAspectRatio: "slice" fills/crops the container (used
// on wide desktop heroes), "meet" fits the whole map letterboxed (used on
// portrait phones, where slicing a 2:1 map would zoom it ~10x and show only a
// tiny sliver). Overlays drawn on top (routes, pins, icons) MUST use the same
// `fit` value or the two layers scale differently and dots/pins drift apart.
export function getWorldDotsSVG(fit: "slice" | "meet" = "slice", radius = 0.32) {
  const key = `${fit}-${radius}`;
  if (!sharedDotsSVG[key]) {
    const raw = getWorldMap().getSVG({
      shape: "circle",
      radius,
      color: "rgba(244,240,233,0.28)",
      backgroundColor: "transparent",
    });
    sharedDotsSVG[key] = raw.replace("<svg ", `<svg preserveAspectRatio="xMidYMid ${fit}" `);
  }
  return sharedDotsSVG[key];
}
