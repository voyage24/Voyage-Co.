"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import LiveMap, { type LiveMarker } from "@/components/home/LiveMap";
import { getHotelCityCoords } from "@/lib/hotel-coords";
import { getWeeklyFeaturedHotels } from "@/lib/weekly-featured";
import type { Hotel } from "@/lib/types";

const FEATURED_COUNT = 14;

/**
 * Hero background for the Luxury Stays search tab — plots a small set of
 * featured properties as cottage markers on the live world map (cycling
 * weekly through the catalogue). Searching a destination below swaps the
 * display to that city's actual properties and flies the map to it. Clicking
 * any marker goes straight to that property's page.
 */
export default function HotelMapBackground({ hotels, city }: { hotels: Hotel[]; city: string }) {
  const router = useRouter();
  const [captionVisible, setCaptionVisible] = useState(true);

  useEffect(() => {
    setCaptionVisible(true);
    const timer = setTimeout(() => setCaptionVisible(false), 1800);
    return () => clearTimeout(timer);
  }, [city]);

  const weeklyFeatured = useMemo(() => getWeeklyFeaturedHotels(hotels, FEATURED_COUNT), [hotels]);
  const cityHotels = useMemo(() => (city ? hotels.filter(h => h.city === city) : []), [hotels, city]);
  const displayedHotels = city ? cityHotels : weeklyFeatured;

  // Resolve each hotel to real coordinates (its own lat/lng where present,
  // otherwise a city-level lookup, spread so same-city icons don't overlap).
  const markers = useMemo<LiveMarker[]>(() => {
    const out: LiveMarker[] = [];
    const byCity = new Map<string, Hotel[]>();
    for (const h of displayedHotels) {
      if (h.lat != null && h.lng != null) {
        out.push({ id: h.id, lat: h.lat, lng: h.lng, label: h.name, glyph: "home", tone: "amber", onClick: () => router.push(`/hotels/${h.id}`) });
      } else {
        if (!byCity.has(h.city)) byCity.set(h.city, []);
        byCity.get(h.city)!.push(h);
      }
    }
    byCity.forEach((group, cityName) => {
      const base = getHotelCityCoords(cityName);
      if (!base) return;
      group.forEach((h, i) => {
        const spread = 0.35;
        const angle = (i / Math.max(1, group.length)) * 2 * Math.PI;
        const dLat = group.length > 1 ? Math.sin(angle) * spread : 0;
        const dLng = group.length > 1 ? Math.cos(angle) * spread : 0;
        out.push({ id: h.id, lat: base[0] + dLat, lng: base[1] + dLng, label: h.name, glyph: "home", tone: "amber", onClick: () => router.push(`/hotels/${h.id}`) });
      });
    });
    return out;
  }, [displayedHotels, router]);

  // When a city is searched, fly to it; otherwise frame the featured set.
  const flyTo = useMemo<[number, number, number?] | null>(() => {
    if (!city) return null;
    const base = getHotelCityCoords(city);
    return base ? [base[0], base[1], 6] : null;
  }, [city]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <LiveMap markers={markers} fit={!city} flyTo={flyTo} />

      <div
        className="absolute top-28 right-6 sm:right-12 text-white/90 text-right max-w-xs transition-opacity duration-700 pointer-events-none z-[2]"
        style={{ opacity: captionVisible ? 1 : 0 }}
      >
        {cityHotels.length > 0 ? (
          <p className="text-[11px] text-white/70 font-light italic drop-shadow">
            {cityHotels.length} stay{cityHotels.length !== 1 ? "s" : ""} in {city} — click one to view it
          </p>
        ) : (
          <p className="text-[11px] text-white/70 font-light italic drop-shadow">
            This week&apos;s featured stays — hover or click any to explore
          </p>
        )}
      </div>
    </div>
  );
}
