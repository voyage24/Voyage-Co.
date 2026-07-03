"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getWorldMap, getWorldDotsSVG } from "@/lib/world-map-singleton";
import { getCoords } from "@/lib/geo";
import { CITIES } from "@/lib/mock-data";
import type { City } from "@/lib/types";

const CODES = [
  "DEL","BOM","BLR","GOI","DXB","AUH","RUH","JED","DOH","IST","TLV",
  "CAI","JNB","CPT","NBO","LOS","CMN",
  "LHR","CDG","FRA","MAD","FCO","AMS","ZRH","VIE","ATH","LIS","PRG","BUD","ARN","WAW",
  "JFK","LAX","SFO","ORD","MIA","YYZ","YVR","GRU","EZE","MEX",
  "SIN","BKK","KUL","CGK","MNL","HKG","ICN","PEK","PVG","HND","NRT","TPE","KTM","CMB",
  "SYD","AKL","DPS","HNL",
];

export default function ExploreMap() {
  const router = useRouter();
  const map = useMemo(() => getWorldMap(), []);
  const dotsSVG = useMemo(() => getWorldDotsSVG(), []);
  const { width, height } = map.image;
  const [hovered, setHovered] = useState<City | null>(null);

  const points = useMemo(() => {
    return CODES.map(code => {
      const city = CITIES.find(c => c.code === code);
      if (!city) return null;
      const [lat, lng] = getCoords(city.code, city.country);
      const pin = map.getPin({ lat, lng });
      return pin ? { city, x: pin.x, y: pin.y } : null;
    }).filter((p): p is { city: City; x: number; y: number } => !!p);
  }, [map]);

  const go = (city: City) => router.push(`/hotels?city=${encodeURIComponent(city.name)}`);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-vc-700" style={{ aspectRatio: `${width} / ${height}`, background: "radial-gradient(135% 100% at 50% 6%, #4b4f55 0%, #3a3e43 45%, #26282c 100%)" }}>
      <div className="absolute inset-0 [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: dotsSVG }} />
      <svg viewBox={`0 0 ${width} ${height}`} className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
        {points.map(({ city, x, y }) => (
          <g
            key={city.code}
            className="dest-dot"
            role="button"
            aria-label={`Explore stays in ${city.name}`}
            style={{ cursor: "pointer", pointerEvents: "auto" }}
            onClick={() => go(city)}
            onMouseEnter={() => setHovered(city)}
            onMouseLeave={() => setHovered(h => (h?.code === city.code ? null : h))}
          >
            <circle cx={x} cy={y} r={2.6} fill="transparent" />
            <circle cx={x} cy={y} r={0.4} fill="#f4f0e9" opacity={0.6} />
          </g>
        ))}
      </svg>

      {/* Hovered city label */}
      <div className="absolute left-4 bottom-4 pointer-events-none">
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
