"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type * as L from "leaflet";
import "leaflet/dist/leaflet.css";
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

// CARTO's free, key-less basemaps — "Positron" (light, ash-grey) and
// "Dark Matter" (near-black) — so the live map matches the site's luxe grey
// aesthetic in both themes without any Mapbox/Google token.
const TILES = {
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
};
const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

function isDark() {
  return typeof document !== "undefined" && document.documentElement.classList.contains("dark");
}

/**
 * A real, interactive Leaflet slippy map that plots the traveller's chosen
 * From/To cities plus popular destinations from live coordinate data, draws
 * the route between them, and smoothly flies/zooms to whatever location the
 * traveller selects (either a From/To in the search form or a marker click).
 * Uses key-less CARTO raster tiles that swap light/dark with the site theme.
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
  const tileRef = useRef<L.TileLayer | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  // Keep the latest select handler without re-binding every marker.
  const onSelectRef = useRef(onSelectDestination);
  onSelectRef.current = onSelectDestination;
  const [ready, setReady] = useState(false);

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
        scrollWheelZoom: false, // don't hijack page scroll on the hero
        attributionControl: true,
        worldCopyJump: true,
        zoomAnimation: true,
        fadeAnimation: true,
      });
      mapRef.current = map;

      tileRef.current = Lm.tileLayer(isDark() ? TILES.dark : TILES.light, {
        attribution: TILE_ATTR,
        subdomains: "abcd",
        detectRetina: true,
        maxZoom: 20,
      }).addTo(map);

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

  // Swap tiles when the site theme flips between light and dark.
  useEffect(() => {
    const el = document.documentElement;
    const apply = () => {
      const Lm = LRef.current, map = mapRef.current;
      if (!Lm || !map) return;
      tileRef.current?.remove();
      tileRef.current = Lm.tileLayer(isDark() ? TILES.dark : TILES.light, {
        attribution: TILE_ATTR,
        subdomains: "abcd",
        detectRetina: true,
        maxZoom: 20,
      }).addTo(map);
    };
    const obs = new MutationObserver(apply);
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

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
    <div
      ref={containerRef}
      className="absolute inset-0 h-full w-full vc-live-map"
      style={{ background: "radial-gradient(140% 115% at 50% 55%, #3a3a3d 0%, #2c2c2f 55%, #202022 100%)" }}
    />
  );
}
