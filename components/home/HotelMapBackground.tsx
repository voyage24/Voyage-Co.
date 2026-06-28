"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getWorldMap, getWorldDotsSVG } from "@/lib/world-map-singleton";
import { useIsMobile } from "@/lib/useIsMobile";
import { getHotelCityCoords } from "@/lib/hotel-coords";
import { getWeeklyFeaturedHotels } from "@/lib/weekly-featured";
import type { Hotel } from "@/lib/types";

const FEATURED_COUNT = 14;

// Lucide's "Home" icon path data, embedded natively as SVG so it can live
// inside the map's own coordinate space (HTML overlays don't line up
// correctly against an SVG using preserveAspectRatio="slice"). Uses
// currentColor so the hover-to-orange effect can be done in pure CSS
// (app/globals.css .hotel-dot:hover) instead of a re-render per icon.
const HOME_PATH = "m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z";
const HOME_ROOFLINE = "9 22 9 12 15 12 15 22";

function CottageGlyph({ scale }: { scale: number }) {
  return (
    <g transform={`scale(${scale}) translate(-12,-12)`}>
      <path d={HOME_PATH} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={HOME_ROOFLINE} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/**
 * Hero background for the Luxury Stays search tab — plots a small set of
 * featured properties as cottage icons on the world dot map (cycling weekly
 * through the full catalogue, rather than showing all of them at once, so
 * there's room to keep every icon comfortably interactive). Searching a
 * destination below swaps the display to that city's actual properties.
 * Hovering any icon turns it orange; clicking goes straight to that
 * property's page — there's deliberately no intermediate caption/popup on
 * click, since a text box appearing over a cluster of icons would block
 * clicking the others nearby.
 */
export default function HotelMapBackground({ hotels, city }: { hotels: Hotel[]; city: string }) {
  const router = useRouter();
  const map = useMemo(() => getWorldMap(), []);
  const isMobile = useIsMobile();
  const fit = isMobile ? "meet" : "slice";
  const dotsSVG = useMemo(() => getWorldDotsSVG(fit), [fit]);
  const { width, height } = map.image;
  const [captionVisible, setCaptionVisible] = useState(true);

  // The idle caption only ever shows once, briefly, on load or when the
  // city search changes — never as a result of clicking something on the
  // map, so it can't keep popping back up and blocking further clicks.
  useEffect(() => {
    setCaptionVisible(true);
    const timer = setTimeout(() => setCaptionVisible(false), 1800);
    return () => clearTimeout(timer);
  }, [city]);

  const weeklyFeatured = useMemo(() => getWeeklyFeaturedHotels(hotels, FEATURED_COUNT), [hotels]);
  const cityHotels = city ? hotels.filter(h => h.city === city) : [];
  const displayedHotels = city ? cityHotels : weeklyFeatured;

  const points = useMemo(() => {
    const result: { hotel: Hotel; x: number; y: number }[] = [];

    // Hotels with their own precise lat/lng (the master dataset import) are
    // plotted directly — no city-level approximation or jitter needed.
    const withOwnCoords = displayedHotels.filter(h => h.lat != null && h.lng != null);
    for (const hotel of withOwnCoords) {
      const pin = map.getPin({ lat: hotel.lat!, lng: hotel.lng! });
      if (pin) result.push({ hotel, ...pin });
    }

    // The original curated hotels have no per-property coordinates — fall
    // back to city-level lookup, spreading multiples in the same city so
    // their icons don't overlap.
    const withoutOwnCoords = displayedHotels.filter(h => h.lat == null || h.lng == null);
    const byCity = new Map<string, Hotel[]>();
    for (const hotel of withoutOwnCoords) {
      if (!byCity.has(hotel.city)) byCity.set(hotel.city, []);
      byCity.get(hotel.city)!.push(hotel);
    }
    byCity.forEach((group, cityName) => {
      const base = getHotelCityCoords(cityName);
      if (!base) return;
      group.forEach((hotel, i) => {
        const spread = 0.9;
        const angle = (i / group.length) * 2 * Math.PI;
        const dLat = group.length > 1 ? Math.sin(angle) * spread : 0;
        const dLng = group.length > 1 ? Math.cos(angle) * spread : 0;
        const pin = map.getPin({ lat: base[0] + dLat, lng: base[1] + dLng });
        if (pin) result.push({ hotel, ...pin });
      });
    });
    return result;
  }, [displayedHotels, map]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-[#2b0f14] via-[#3d1620] to-[#1c0a0d]">
      <div
        className="absolute inset-0 w-full h-full [&>svg]:w-full [&>svg]:h-full"
        dangerouslySetInnerHTML={{ __html: dotsSVG }}
      />

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio={`xMidYMid ${fit}`}
      >
        {points.map(p => {
          const isHighlighted = !!city && p.hotel.city === city;
          return (
            <g
              key={p.hotel.id}
              className={`dest-dot hotel-dot ${isHighlighted ? "is-highlighted" : ""}`}
              role="button"
              aria-label={`Go to ${p.hotel.name}`}
              style={{ cursor: "pointer", pointerEvents: "auto" }}
              onClick={() => router.push(`/hotels/${p.hotel.id}`)}
            >
              {isHighlighted && (
                <circle cx={p.x} cy={p.y} r={0.55} fill="currentColor" className="pulse-ring" />
              )}
              {/* Larger transparent hit-area — the cottage icon's stroke-only
                  outline is too thin on its own to reliably catch hover. */}
              <circle cx={p.x} cy={p.y} r={1.6} fill="transparent" />
              <g transform={`translate(${p.x}, ${p.y})`}>
                <CottageGlyph scale={isHighlighted ? 0.1 : 0.07} />
              </g>
            </g>
          );
        })}
      </svg>

      <div
        className="absolute top-28 right-6 sm:right-12 text-white/90 text-right max-w-xs transition-opacity duration-700 pointer-events-none"
        style={{ opacity: captionVisible ? 1 : 0 }}
      >
        {cityHotels.length > 0 ? (
          <p className="text-[11px] text-white/60 font-light italic">
            {cityHotels.length} stay{cityHotels.length !== 1 ? "s" : ""} in {city} — click one to view it
          </p>
        ) : (
          <p className="text-[11px] text-white/60 font-light italic">
            This week&apos;s featured stays — hover or click any to explore
          </p>
        )}
      </div>
    </div>
  );
}
