"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MousePointerClick } from "lucide-react";
import { getCoords } from "@/lib/geo";
import { CITIES } from "@/lib/mock-data";
import { POPULAR_DESTINATION_CODES } from "@/lib/popular-destination-codes";
import { MAP_IMAGERY_URL, MAP_LABELS_URL, MAP_IMAGERY_ATTR } from "@/lib/map-tiles";
import { useIsMobile } from "@/lib/useIsMobile";
import type { City } from "@/lib/types";

/**
 * A real, interactive Leaflet world map for browsing destinations — same
 * satellite imagery and "click to zoom" scroll-lock convention as the hero's
 * DestinationMap, but standalone (no from/to search state): every popular
 * destination is plotted, and clicking one goes straight to its hotels.
 */
export default function ExploreMap() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [zoomActive, setZoomActive] = useState(false);
  const [hovered, setHovered] = useState<City | null>(null);

  useEffect(() => {
    let disposed = false;
    let map: L.Map | null = null;

    import("leaflet").then(mod => {
      const Lm = (mod.default ?? mod) as typeof L;
      if (disposed || !containerRef.current) return;

      map = Lm.map(containerRef.current, {
        center: [22, 12],
        zoom: isMobile ? 1 : 2,
        minZoom: 1,
        maxZoom: 10,
        zoomControl: true,
        zoomSnap: 0, // smooth fractional zoom for modifier-scroll
        scrollWheelZoom: false, // handled manually (modifier + scroll only)
        attributionControl: true,
        worldCopyJump: true,
      });
      mapRef.current = map;
      map.zoomControl?.setPosition("topright");
      // "Click to zoom": scroll/trackpad zoom activates once the map is
      // clicked (so plain page-scrolling over it never zooms by accident).
      map.on("click", () => { map!.scrollWheelZoom.enable(); setZoomActive(true); });
      map.getContainer().addEventListener("mouseleave", () => { map!.scrollWheelZoom.disable(); setZoomActive(false); });

      Lm.tileLayer(MAP_IMAGERY_URL, { attribution: MAP_IMAGERY_ATTR, detectRetina: false, maxZoom: 19, className: "vc-tiles-base" }).addTo(map);
      Lm.tileLayer(MAP_LABELS_URL, { detectRetina: false, maxZoom: 19, className: "vc-tiles-ref", opacity: 0.9 }).addTo(map);

      for (const code of POPULAR_DESTINATION_CODES) {
        const city = CITIES.find(c => c.code === code);
        if (!city) continue;
        const coords = getCoords(city.code, city.country);
        const marker = Lm.circleMarker(coords, {
          radius: 4, color: "#d8c48f", weight: 1, fillColor: "#e9dcb4", fillOpacity: 0.85,
        });
        marker.on("mouseover", () => { marker.setStyle({ radius: 6, fillOpacity: 1 }); setHovered(city); });
        marker.on("mouseout", () => { marker.setStyle({ radius: 4, fillOpacity: 0.85 }); setHovered(h => (h?.code === city.code ? null : h)); });
        marker.on("click", () => router.push(`/hotels?city=${encodeURIComponent(city.name)}`));
        marker.addTo(map);
      }

      setTimeout(() => map?.invalidateSize(), 0);
    });

    return () => {
      disposed = true;
      map?.remove();
      mapRef.current = null;
    };
    // Created once on mount (reads isMobile's value at that point only) —
    // recreating the whole map on every breakpoint crossing would blink the
    // tiles/markers and reset the traveller's own pan/zoom.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden border border-line">
      <div
        ref={containerRef}
        className="absolute inset-0 h-full w-full vc-live-map"
        style={{ background: "radial-gradient(140% 115% at 50% 55%, #1c3a4a 0%, #122a37 55%, #0b1a24 100%)" }}
      />

      <div
        aria-hidden
        className="glass-pill glass-pill-pulse pointer-events-none absolute top-3 right-14 z-[1000] flex items-center gap-1.5 text-[11px] tracking-wide px-3 py-1.5 transition-opacity duration-300"
        style={{ opacity: zoomActive ? 0 : 1 }}
      >
        <MousePointerClick size={13} /> Click to zoom
      </div>

      {/* Hovered city label */}
      <div className="absolute left-4 bottom-4 z-[1000] pointer-events-none">
        {hovered ? (
          <div className="bg-vc-950/80 backdrop-blur-sm px-4 py-2.5 border border-gold/30">
            <p className="text-[10px] tracking-[0.2em] uppercase text-gold">{hovered.country}</p>
            <p className="font-serif text-lg font-light text-[#f4f0e9]">{hovered.name}</p>
            <p className="text-[10px] tracking-[0.14em] uppercase text-white/60 mt-0.5">View stays →</p>
          </div>
        ) : (
          <p className="text-[11px] tracking-[0.16em] uppercase text-white/50">Tap a point to explore</p>
        )}
      </div>
    </div>
  );
}
