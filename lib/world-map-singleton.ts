import DottedMap from "dotted-map/without-countries";
import type { MapData } from "dotted-map/without-countries";
import mapData from "@/lib/world-map-data.json";

// The world dot-grid is expensive-ish to instantiate and never changes, so it's
// built once per page load and shared by every map on the page (hero map,
// per-flight-card mini maps, etc.) instead of each component recomputing it.
let sharedMap: InstanceType<typeof DottedMap> | null = null;
let sharedDotsSVG: string | null = null;

export function getWorldMap() {
  if (!sharedMap) sharedMap = new DottedMap({ map: mapData as unknown as MapData });
  return sharedMap;
}

export function getWorldDotsSVG() {
  if (!sharedDotsSVG) {
    const raw = getWorldMap().getSVG({
      shape: "circle",
      radius: 0.32,
      color: "rgba(244,240,233,0.28)",
      backgroundColor: "transparent",
    });
    // dotted-map's own <svg> doesn't set preserveAspectRatio, so it defaults
    // to "meet" (fit, letterboxed) while every overlay drawn on top of it
    // (routes, pins, icons) explicitly uses "slice" (fill, cropped) to match
    // the hero's aspect ratio. Without forcing this dots layer to "slice"
    // too, the two layers scale differently whenever the container's aspect
    // ratio doesn't exactly match the map's — which is everywhere — so dots
    // and pins drift apart. This was the root cause of every map looking
    // inaccurate.
    sharedDotsSVG = raw.replace("<svg ", '<svg preserveAspectRatio="xMidYMid slice" ');
  }
  return sharedDotsSVG;
}
