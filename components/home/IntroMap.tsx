"use client";

import { useEffect, useRef } from "react";
import type * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useIsMobile } from "@/lib/useIsMobile";

// Same key-less Esri imagery as the real hero map (DestinationMap) — reused
// here rather than imported, since this map is a stripped-down, read-only
// decorative variant, not the interactive one.
const IMAGERY_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const LABELS_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";
const IMAGERY_ATTR = 'Imagery &copy; <a href="https://www.esri.com">Esri</a>, Maxar, Earthstar Geographics';

const CENTER: [number, number] = [22, 12];

/**
 * A non-interactive backdrop map for the homepage intro: opens tight on a
 * region, then pulls back to the exact center/zoom the real hero map
 * (DestinationMap) rests at with no route selected — so when the iris wipe
 * hands off to the real page, the view doesn't jump. No controls, markers,
 * or click handling; this is scenery, not the real map.
 */
export default function IntroMap({ zoomOutMs = 1700, startDelayMs = 150 }: { zoomOutMs?: number; startDelayMs?: number }) {
  const isMobile = useIsMobile();
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let disposed = false;
    let map: L.Map | null = null;
    let flyTimer: ReturnType<typeof setTimeout> | undefined;
    const endZoom = isMobile ? 1 : 2; // matches DestinationMap's worldZoom default
    const startZoom = endZoom + 3;    // tight enough to read as a real pull-back

    import("leaflet").then(mod => {
      const Lm = (mod.default ?? mod) as typeof L;
      if (disposed || !ref.current) return;

      map = Lm.map(ref.current, {
        center: CENTER,
        zoom: startZoom,
        zoomControl: false,
        attributionControl: true,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
        boxZoom: false,
        keyboard: false,
        zoomSnap: 0,
        fadeAnimation: true,
        zoomAnimation: true,
      });
      Lm.tileLayer(IMAGERY_URL, { attribution: IMAGERY_ATTR, detectRetina: false, maxZoom: 19, className: "vc-tiles-base" }).addTo(map);
      Lm.tileLayer(LABELS_URL, { detectRetina: false, maxZoom: 19, className: "vc-tiles-ref", opacity: 0.9 }).addTo(map);
      setTimeout(() => map?.invalidateSize(), 0);

      // Let the tight framing register for a beat before pulling back.
      flyTimer = setTimeout(() => {
        map?.flyTo(CENTER, endZoom, { duration: zoomOutMs / 1000, easeLinearity: 0.25 });
      }, startDelayMs);
    });

    return () => {
      disposed = true;
      clearTimeout(flyTimer);
      map?.remove();
    };
  }, [isMobile, zoomOutMs, startDelayMs]);

  return (
    <div
      ref={ref}
      className="absolute inset-0 h-full w-full vc-live-map"
      style={{ background: "radial-gradient(140% 115% at 50% 55%, #1c3a4a 0%, #122a37 55%, #0b1a24 100%)" }}
    />
  );
}
