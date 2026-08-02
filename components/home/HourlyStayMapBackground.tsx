"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import LiveMap, { type LiveMarker } from "@/components/home/LiveMap";
import { resolveCoords } from "@/lib/place-coords";
import type { HourlyStay } from "@/lib/types";

/**
 * Hero background for the Hourly Stays search tab — plots every city with
 * day-use rooms as a marker on the live world map. Clicking a pin jumps
 * straight to that city's hourly stays.
 */
export default function HourlyStayMapBackground({ stays }: { stays: HourlyStay[] }) {
  const router = useRouter();
  const [captionVisible, setCaptionVisible] = useState(true);

  const cities = useMemo(() => Array.from(new Set(stays.map(s => s.city))), [stays]);

  const markers = useMemo<LiveMarker[]>(() => {
    const out: LiveMarker[] = [];
    for (const city of cities) {
      const coords = resolveCoords(city);
      if (!coords) continue;
      out.push({ id: city, lat: coords[0], lng: coords[1], label: city, glyph: "sparkle", tone: "emerald", onClick: () => router.push(`/hourly-stays?city=${encodeURIComponent(city)}`) });
    }
    return out;
  }, [cities, router]);

  return (
    <div className="absolute inset-0 overflow-hidden" onClick={() => setCaptionVisible(false)}>
      <LiveMap markers={markers} fit />

      <div
        className="absolute top-28 right-6 sm:right-12 text-white/90 text-right max-w-xs transition-opacity duration-700 pointer-events-none z-[2]"
        style={{ opacity: captionVisible ? 1 : 0 }}
      >
        <p className="text-[11px] text-white/70 font-light italic drop-shadow">
          {cities.length} cit{cities.length !== 1 ? "ies" : "y"} with hourly stays — click a pin to explore
        </p>
      </div>
    </div>
  );
}
