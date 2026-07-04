"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MousePointerClick } from "lucide-react";
import { useIsMobile } from "@/lib/useIsMobile";
import { getCoords } from "@/lib/geo";
import { CITIES } from "@/lib/mock-data";
import type { City } from "@/lib/types";

// Airports plotted as clickable points — lets the map double as a quick
// worldwide destination picker, not just a route visualiser.
const POPULAR_DESTINATION_CODES = [
  // South Asia & Middle East
  "DEL", "BOM", "BLR", "GOI", "DXB", "AUH", "RUH", "JED", "DOH", "IST", "TLV",
  // Africa
  "CAI", "JNB", "CPT", "NBO", "LOS", "CMN",
  // Europe
  "LHR", "CDG", "FRA", "MAD", "FCO", "AMS", "ZRH", "VIE", "ATH", "LIS", "PRG", "BUD", "ARN", "WAW",
  // The Americas
  "JFK", "LAX", "SFO", "ORD", "MIA", "YYZ", "YVR", "GRU", "EZE", "MEX",
  // Southeast & East Asia
  "SIN", "BKK", "KUL", "CGK", "MNL", "HKG", "ICN", "PEK", "PVG", "HND", "NRT", "TPE", "KTM", "CMB",
  // Oceania
  "SYD", "AKL", "DPS", "HNL",
];

// Key-less Esri World Imagery — real satellite/terrain earth imagery (natural
// greens, blues and mountains) rather than a flat grey basemap. The same
// imagery serves both themes; dark mode is darkened in CSS to read as an
// elegant night view while staying natural.
const IMAGERY_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const LABELS_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";
const IMAGERY_ATTR = 'Imagery &copy; <a href="https://www.esri.com">Esri</a>, Maxar, Earthstar Geographics';

/**
 * A real, interactive Leaflet slippy map that plots the traveller's chosen
 * From/To cities plus popular destinations from live coordinate data, draws
 * the route between them, and smoothly flies/zooms to whatever location the
 * traveller selects (either a From/To in the search form or a marker click).
 * Uses key-less Esri satellite imagery + a place-name reference overlay.
 */
export default function DestinationMap({
  from, to, onSelectDestination,
}: {
  from: City | null;
  to: City | null;
  onSelectDestination?: (city: City) => void;
}) {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const LRef = useRef<typeof L | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  // Keep the latest select handler without re-binding every marker.
  const onSelectRef = useRef(onSelectDestination);
  onSelectRef.current = onSelectDestination;
  const [ready, setReady] = useState(false);
  const [zoomActive, setZoomActive] = useState(false);

  const worldZoom = isMobile ? 1 : 2;

  const destinations = useMemo(
    () =>
      POPULAR_DESTINATION_CODES
        .map(code => CITIES.find(c => c.code === code))
        .filter((c): c is City => !!c)
        .map(city => ({ city, coords: getCoords(city.code, city.country) as [number, number] })),
    []
  );

  // Create the map once, on mount (Leaflet is loaded lazily so it never runs
  // during SSR and stays out of the initial bundle).
  useEffect(() => {
    let disposed = false;
    let map: L.Map | null = null;

    import("leaflet").then(mod => {
      const Lm = (mod.default ?? mod) as typeof L;
      if (disposed || !containerRef.current) return;
      LRef.current = Lm;

      map = Lm.map(containerRef.current, {
        center: [22, 12],
        zoom: worldZoom,
        minZoom: 1,
        maxZoom: 12,
        zoomControl: true,
        zoomSnap: 0, // smooth fractional zoom for modifier-scroll
        scrollWheelZoom: false, // handled manually (modifier + scroll only)
        attributionControl: true,
        worldCopyJump: true,
        zoomAnimation: true,
        fadeAnimation: true,
      });
      mapRef.current = map;
      // Top-right — clear now that the navbar is a band above the map. The
      // bottom/centre corners were hidden behind the full-width search widget,
      // which left the lower "−" button unclickable on desktop.
      map.zoomControl?.setPosition("topright");
      // "Click to zoom": scroll/trackpad zoom activates once the map is clicked
      // (so plain scrolling over the hero never zooms by accident) and switches
      // back off — re-showing the hint — when the pointer leaves the map.
      map.on("click", () => { map!.scrollWheelZoom.enable(); setZoomActive(true); });
      map.getContainer().addEventListener("mouseleave", () => { map!.scrollWheelZoom.disable(); setZoomActive(false); });

      // Base imagery + translucent place-name/boundary overlay (kept on top
      // via zIndex), then the route + destination markers above.
      Lm.tileLayer(IMAGERY_URL, { attribution: IMAGERY_ATTR, detectRetina: false, maxZoom: 19, className: "vc-tiles-base", zIndex: 1 }).addTo(map);
      Lm.tileLayer(LABELS_URL, { detectRetina: false, maxZoom: 19, className: "vc-tiles-ref", zIndex: 2, opacity: 0.9 }).addTo(map);

      routeLayerRef.current = Lm.layerGroup().addTo(map);

      // Popular-destination markers — small gold dots; click to pick one.
      const destLayer = Lm.layerGroup().addTo(map);
      for (const { city, coords } of destinations) {
        const m = Lm.circleMarker(coords, {
          radius: 3.5,
          color: "#d8c48f",
          weight: 1,
          fillColor: "#e9dcb4",
          fillOpacity: 0.85,
        });
        m.bindTooltip(`${city.name} (${city.code})`, { direction: "top", offset: [0, -4], opacity: 0.9 });
        if (onSelectRef.current) {
          m.on("mouseover", () => m.setStyle({ radius: 5.5, fillOpacity: 1 }));
          m.on("mouseout", () => m.setStyle({ radius: 3.5, fillOpacity: 0.85 }));
          m.on("click", () => onSelectRef.current?.(city));
        }
        m.addTo(destLayer);
      }

      // Fit to the container once it has real dimensions.
      setTimeout(() => map?.invalidateSize(), 0);
      setReady(true);
    });

    return () => {
      disposed = true;
      map?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dark mode is handled purely in CSS (the imagery is theme-independent), so
  // there's no tile layer to swap on theme change.

  // Re-fit the world zoom when crossing the mobile breakpoint.
  useEffect(() => {
    const map = mapRef.current;
    if (map && !from && !to) map.setZoom(worldZoom);
  }, [worldZoom, from, to]);

  // Draw From/To pins + route, and fly/zoom to the chosen location(s).
  useEffect(() => {
    const Lm = LRef.current, map = mapRef.current, layer = routeLayerRef.current;
    if (!Lm || !map || !layer) return;
    layer.clearLayers();

    const fromC = from ? (getCoords(from.code, from.country) as [number, number]) : null;
    const toC = to ? (getCoords(to.code, to.country) as [number, number]) : null;

    const pin = (c: [number, number], fill: string, ring: string) =>
      Lm.circleMarker(c, { radius: 6, color: ring, weight: 2, fillColor: fill, fillOpacity: 1 }).addTo(layer);

    if (fromC) pin(fromC, "#e9dcb4", "#b89b52").bindTooltip(from!.name, { permanent: false, direction: "top" });
    if (toC) pin(toC, "#ffffff", "#b89b52").bindTooltip(to!.name, { permanent: false, direction: "top" });

    if (fromC && toC) {
      Lm.polyline([fromC, toC], {
        color: "#d8c48f",
        weight: 2,
        opacity: 0.9,
        dashArray: "6 8",
      }).addTo(layer);
      // Frame both endpoints with breathing room.
      map.flyToBounds(Lm.latLngBounds([fromC, toC]).pad(0.4), { duration: 1.1, maxZoom: 7 });
    } else if (toC) {
      map.flyTo(toC, isMobile ? 5 : 6, { duration: 1.2 });
    } else if (fromC) {
      map.flyTo(fromC, isMobile ? 5 : 6, { duration: 1.2 });
    } else {
      map.flyTo([22, 12], worldZoom, { duration: 1.0 });
    }
  }, [from, to, isMobile, worldZoom, ready]);

  return (
    <div className="absolute inset-0 h-full w-full">
      <div
        ref={containerRef}
        className="absolute inset-0 h-full w-full vc-live-map"
        style={{ background: "radial-gradient(140% 115% at 50% 55%, #1c3a4a 0%, #122a37 55%, #0b1a24 100%)" }}
      />
      {/* Persistent "Click to zoom" affordance next to the +/- control, shown
          whenever zoom is inactive so it never gets lost. */}
      <div
        aria-hidden
        className="glass-pill glass-pill-pulse pointer-events-none absolute top-3 right-14 z-[1000] flex items-center gap-1.5 text-[11px] tracking-wide px-3 py-1.5 transition-opacity duration-300"
        style={{ opacity: zoomActive ? 0 : 1 }}
      >
        <MousePointerClick size={13} /> Click to zoom
      </div>
    </div>
  );
}
