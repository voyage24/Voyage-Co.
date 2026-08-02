"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import LiveMap, { type LiveMarker, type LiveRoute } from "@/components/home/LiveMap";
import { resolveCoords } from "@/lib/place-coords";
import type { OutstationCab } from "@/lib/types";

/**
 * Hero background for the Outstation Cabs search tab — cycles through a
 * handful of routes, plotting each one's origin-to-destination journey on
 * the live map, in place of the world destination map or a static photo.
 */
export default function OutstationCabMapBackground({ cabs }: { cabs: OutstationCab[] }) {
  const [index, setIndex] = useState(0);
  const [captionVisible, setCaptionVisible] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();

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
    if (cabs.length < 2) return;
    const timer = setInterval(() => setIndex(i => (i + 1) % cabs.length), 5500);
    return () => clearInterval(timer);
  }, [cabs.length]);

  const current = cabs[index];

  const stops = useMemo(() => {
    if (!current) return [];
    const from = resolveCoords(current.originCity);
    const to = resolveCoords(current.destinationCity);
    const out: { name: string; lat: number; lng: number; end?: boolean }[] = [];
    if (from) out.push({ name: current.originCity, lat: from[0], lng: from[1] });
    if (to) out.push({ name: current.destinationCity, lat: to[0], lng: to[1], end: true });
    return out;
  }, [current]);

  const markers = useMemo<LiveMarker[]>(
    () => (current ? stops.map((s, i) => ({ id: `${current.id}-${i}`, lat: s.lat, lng: s.lng, label: s.name, glyph: "compass", tone: s.end ? "cream" : "rose" })) : []),
    [stops, current]
  );

  const routes = useMemo<LiveRoute[]>(
    () => (current && stops.length > 1 ? [{ id: current.id, points: stops.map(s => [s.lat, s.lng] as [number, number]), tone: "rose" }] : []),
    [stops, current]
  );

  const frame = useMemo<[number, number][]>(() => stops.map(s => [s.lat, s.lng]), [stops]);

  if (!current) return null;

  return (
    <div className="absolute inset-0" onClick={() => setCaptionVisible(false)}>
      <LiveMap key={current.id} markers={markers} routes={routes} frame={frame.length ? frame : null} fit={false} />

      <div
        className="absolute top-28 right-6 sm:right-12 text-white/90 text-right transition-opacity duration-500"
        style={{ opacity: captionVisible ? 1 : 0 }}
      >
        <p className="text-[10px] tracking-[0.28em] uppercase text-gold mb-1">Featured Route</p>
        <p className="font-serif text-xl">{current.title}</p>
        <p className="text-xs text-white/70 font-light">{current.originCity} · {current.destinationCity}</p>
      </div>

      <div className="absolute top-[13.5rem] right-6 sm:right-12 flex gap-1.5">
        {cabs.map((cab, i) => (
          <button
            key={cab.id}
            onClick={e => { e.stopPropagation(); setIndex(i); revealCaptionBriefly(); }}
            aria-label={`Show ${cab.title}`}
            className="py-3 -my-3 flex items-center"
          >
            <span className={`block w-6 h-[2px] transition-colors ${i === index ? "bg-gold" : "bg-white/30"}`} />
          </button>
        ))}
      </div>
    </div>
  );
}
