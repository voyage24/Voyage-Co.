"use client";

import { useEffect, useRef, useState } from "react";
import CruiseRouteMap from "@/components/home/CruiseRouteMap";
import type { Cruise } from "@/lib/types";

/**
 * Hero background for the Cruises search tab — cycles through every voyage
 * in the catalogue, plotting each one's actual itinerary (departure port
 * through every port of call) on the interactive world map, in place of the
 * destination map or a static photo.
 */
export default function CruiseMapBackground({ cruises }: { cruises: Cruise[] }) {
  const [index, setIndex] = useState(0);
  const [captionVisible, setCaptionVisible] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();

  // Caption only appears once on load and again when explicitly requested
  // (clicking a slide indicator) — NOT on every automatic background cycle,
  // otherwise it would keep popping back up on its own indefinitely.
  const revealCaptionBriefly = () => {
    setCaptionVisible(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setCaptionVisible(false), 1800);
  };

  useEffect(() => {
    revealCaptionBriefly();
    return () => clearTimeout(hideTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setIndex(i => (i + 1) % cruises.length), 5500);
    return () => clearInterval(timer);
  }, [cruises.length]);

  const current = cruises[index];
  if (!current) return null;

  return (
    <div className="absolute inset-0" onClick={() => setCaptionVisible(false)}>
      <CruiseRouteMap key={current.id} cruise={current} />

      {/* Positioned top-right — clear of both the headline and the search widget */}
      <div
        className="absolute top-28 right-6 sm:right-12 text-white/90 text-right transition-opacity duration-500"
        style={{ opacity: captionVisible ? 1 : 0 }}
      >
        <p className="text-[10px] tracking-[0.28em] uppercase text-gold mb-1">Featured Voyage</p>
        <p className="font-serif text-xl">{current.name}</p>
        <p className="text-xs text-white/70 font-light">{current.cruiseLine} · {current.ship}</p>
      </div>

      <div className="absolute top-[13.5rem] right-6 sm:right-12 flex gap-1.5">
        {cruises.map((cruise, i) => (
          <button
            key={cruise.id}
            onClick={e => { e.stopPropagation(); setIndex(i); revealCaptionBriefly(); }}
            aria-label={`Show ${cruise.name}`}
            className="py-3 -my-3 flex items-center"
          >
            <span className={`block w-6 h-[2px] transition-colors ${i === index ? "bg-gold" : "bg-white/30"}`} />
          </button>
        ))}
      </div>
    </div>
  );
}
