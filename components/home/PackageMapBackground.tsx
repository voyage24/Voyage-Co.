"use client";

import { useEffect, useRef, useState } from "react";
import PackageRouteMap from "@/components/home/PackageRouteMap";
import type { Package } from "@/lib/types";

/**
 * Hero background for the Bespoke Journeys search tab — cycles through a
 * handful of featured curated itineraries, plotting each one's actual
 * multi-city route on the interactive world map, in place of the generic
 * flights destination map.
 */
export default function PackageMapBackground({ packages }: { packages: Package[] }) {
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
    const timer = setInterval(() => setIndex(i => (i + 1) % packages.length), 5500);
    return () => clearInterval(timer);
  }, [packages.length]);

  const current = packages[index];
  if (!current) return null;

  return (
    <div className="absolute inset-0" onClick={() => setCaptionVisible(false)}>
      <PackageRouteMap key={current.id} pkg={current} />

      <div
        className="absolute top-28 right-6 sm:right-12 text-white/90 text-right transition-opacity duration-500"
        style={{ opacity: captionVisible ? 1 : 0 }}
      >
        <p className="text-[10px] tracking-[0.28em] uppercase text-gold mb-1">Featured Journey</p>
        <p className="font-serif text-xl">{current.title}</p>
        <p className="text-xs text-white/70 font-light">{current.subtitle}</p>
      </div>

      <div className="absolute top-[13.5rem] right-6 sm:right-12 flex gap-1.5">
        {packages.map((pkg, i) => (
          <button
            key={pkg.id}
            onClick={e => { e.stopPropagation(); setIndex(i); revealCaptionBriefly(); }}
            aria-label={`Show ${pkg.title}`}
            className="py-3 -my-3 flex items-center"
          >
            <span className={`block w-6 h-[2px] transition-colors ${i === index ? "bg-gold" : "bg-white/30"}`} />
          </button>
        ))}
      </div>
    </div>
  );
}
