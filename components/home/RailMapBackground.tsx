"use client";

import { useEffect, useRef, useState } from "react";
import RailRouteMap from "@/components/home/RailRouteMap";
import type { Train } from "@/lib/types";

/**
 * Hero background for the Rail Journeys search tab — cycles through a
 * handful of featured trains, plotting each one's origin-to-destination
 * route on a zoomed-in India map, in place of the world destination map or
 * a static photo.
 */
export default function RailMapBackground({ trains }: { trains: Train[] }) {
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
    const timer = setInterval(() => setIndex(i => (i + 1) % trains.length), 5500);
    return () => clearInterval(timer);
  }, [trains.length]);

  const current = trains[index];
  if (!current) return null;

  return (
    <div className="absolute inset-0" onClick={() => setCaptionVisible(false)}>
      <RailRouteMap key={current.id} train={current} />

      <div
        className="absolute top-28 right-6 sm:right-12 text-white/90 text-right transition-opacity duration-500"
        style={{ opacity: captionVisible ? 1 : 0 }}
      >
        <p className="text-[10px] tracking-[0.28em] uppercase text-gold mb-1">Featured Journey</p>
        <p className="font-serif text-xl">{current.name}</p>
        <p className="text-xs text-white/70 font-light">{current.originCity} · {current.destinationCity}</p>
      </div>

      <div className="absolute top-[13.5rem] right-6 sm:right-12 flex gap-1.5">
        {trains.map((train, i) => (
          <button
            key={train.id}
            onClick={e => { e.stopPropagation(); setIndex(i); revealCaptionBriefly(); }}
            aria-label={`Show ${train.name}`}
            className={`w-6 h-[2px] transition-colors ${i === index ? "bg-gold" : "bg-white/30"}`}
          />
        ))}
      </div>
    </div>
  );
}
