"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import LiveMap, { type LiveMarker } from "@/components/home/LiveMap";
import { resolveCoords } from "@/lib/place-coords";
import type { AirportCab } from "@/lib/types";

/**
 * Hero background for the Airport Cabs search tab — plots every city we run
 * airport transfers in as a marker on the live world map. Clicking a pin
 * jumps straight to that city's transfers.
 */
export default function AirportCabMapBackground({ cabs }: { cabs: AirportCab[] }) {
  const router = useRouter();
  const [captionVisible, setCaptionVisible] = useState(true);

  const cities = useMemo(() => Array.from(new Set(cabs.map(c => c.city))), [cabs]);

  const markers = useMemo<LiveMarker[]>(() => {
    const out: LiveMarker[] = [];
    for (const city of cities) {
      const coords = resolveCoords(city);
      if (!coords) continue;
      out.push({ id: city, lat: coords[0], lng: coords[1], label: city, glyph: "compass", tone: "teal", onClick: () => router.push(`/airport-cabs?city=${encodeURIComponent(city)}`) });
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
          {cities.length} cit{cities.length !== 1 ? "ies" : "y"} with airport transfers — click a pin to explore
        </p>
      </div>
    </div>
  );
}
