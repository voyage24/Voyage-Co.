import DottedMap from "dotted-map/without-countries";
import type { MapData } from "dotted-map/without-countries";
import mapData from "@/lib/india-map-data.json";

// Zoomed-in India-only dot-grid, used for the Rail Journeys hero map since
// domestic routes are far too compact to read on the full world map. Built
// once per page load and shared, same pattern as world-map-singleton.ts.
let sharedMap: InstanceType<typeof DottedMap> | null = null;
const sharedDotsSVG: Record<string, string> = {};

export function getIndiaMap() {
  if (!sharedMap) sharedMap = new DottedMap({ map: mapData as unknown as MapData });
  return sharedMap;
}

export function getIndiaDotsSVG(fit: "slice" | "meet" = "slice") {
  if (!sharedDotsSVG[fit]) {
    const raw = getIndiaMap().getSVG({
      shape: "circle",
      radius: 0.3,
      color: "rgba(244,240,233,0.35)",
      backgroundColor: "transparent",
    });
    // See world-map-singleton.ts — the dots layer and every overlay drawn on
    // top must share the same preserveAspectRatio (`fit`) or they scale
    // differently and drift apart. "meet" is used on phones so the map fits
    // the frame instead of being cropped/zoomed.
    sharedDotsSVG[fit] = raw.replace("<svg ", `<svg preserveAspectRatio="xMidYMid ${fit}" `);
  }
  return sharedDotsSVG[fit];
}
