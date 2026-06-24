import DottedMap from "dotted-map/without-countries";
import type { MapData } from "dotted-map/without-countries";
import mapData from "@/lib/india-map-data.json";

// Zoomed-in India-only dot-grid, used for the Rail Journeys hero map since
// domestic routes are far too compact to read on the full world map. Built
// once per page load and shared, same pattern as world-map-singleton.ts.
let sharedMap: InstanceType<typeof DottedMap> | null = null;
let sharedDotsSVG: string | null = null;

export function getIndiaMap() {
  if (!sharedMap) sharedMap = new DottedMap({ map: mapData as unknown as MapData });
  return sharedMap;
}

export function getIndiaDotsSVG() {
  if (!sharedDotsSVG) {
    const raw = getIndiaMap().getSVG({
      shape: "circle",
      radius: 0.3,
      color: "rgba(244,240,233,0.35)",
      backgroundColor: "transparent",
    });
    // See world-map-singleton.ts — dotted-map's own <svg> defaults to
    // preserveAspectRatio="meet" while every overlay on top of it uses
    // "slice", so without forcing this to match, the dot grid and the
    // route/train icons drawn over it scale differently and drift apart.
    sharedDotsSVG = raw.replace("<svg ", '<svg preserveAspectRatio="xMidYMid slice" ');
  }
  return sharedDotsSVG;
}
