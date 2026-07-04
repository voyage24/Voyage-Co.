"use client";

import type * as L from "leaflet";

// The zoom modifier key shown in the hint and required for wheel-zoom — ⌘ on
// Apple devices, Ctrl elsewhere (mirrors Google Maps' embedded-map behaviour).
export function zoomModifierLabel() {
  if (typeof navigator === "undefined") return "Ctrl";
  const p = `${navigator.platform || ""} ${navigator.userAgent || ""}`;
  return /Mac|iPhone|iPad|iPod/.test(p) ? "⌘" : "Ctrl";
}

/**
 * Google-Maps-style modifier-scroll zoom for a Leaflet map: a plain wheel /
 * two-finger scroll passes straight through to the page (and fires
 * `onPlainScroll`, so the caller can flash a "hold ⌘/Ctrl to zoom" hint),
 * while <modifier> + scroll — and trackpad pinch, which the browser reports as
 * ctrl+wheel — zooms smoothly around the cursor. Returns a cleanup function.
 */
export function attachModifierWheelZoom(Lm: typeof L, map: L.Map, onPlainScroll: () => void) {
  const el = map.getContainer();
  const onWheel = (e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const pt = Lm.point(e.clientX - rect.left, e.clientY - rect.top);
      const latlng = map.containerPointToLatLng(pt);
      map.setZoomAround(latlng, map.getZoom() - e.deltaY * 0.008);
    } else {
      onPlainScroll();
    }
  };
  el.addEventListener("wheel", onWheel, { passive: false });
  return () => el.removeEventListener("wheel", onWheel);
}
