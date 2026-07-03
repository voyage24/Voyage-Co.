"use client";

import { useMemo } from "react";
import LiveMap, { type LiveMarker, type LiveRoute } from "@/components/home/LiveMap";
import { getPortCoords } from "@/lib/cruise-ports";
import type { Cruise } from "@/lib/types";

/**
 * Plots a cruise's full itinerary — departure port through every port of
 * call — on the live world map: a ship marker at each port, a dashed route
 * line joining them, framed to the voyage's region.
 */
export default function CruiseRouteMap({ cruise }: { cruise: Cruise }) {
  const stops = useMemo(() => {
    const names = [cruise.departurePort, ...cruise.ports];
    return names
      .map(name => {
        const coords = getPortCoords(name);
        return coords ? { name, lat: coords[0], lng: coords[1] } : null;
      })
      .filter((s): s is { name: string; lat: number; lng: number } => !!s);
  }, [cruise]);

  const markers = useMemo<LiveMarker[]>(
    () =>
      stops.map((s, i) => ({
        id: `${cruise.id}-${i}`,
        lat: s.lat,
        lng: s.lng,
        label: s.name,
        glyph: "ship",
        tone: i === stops.length - 1 ? "cream" : "gold",
      })),
    [stops, cruise.id]
  );

  const routes = useMemo<LiveRoute[]>(
    () => (stops.length > 1 ? [{ id: cruise.id, points: stops.map(s => [s.lat, s.lng] as [number, number]), tone: "gold" }] : []),
    [stops, cruise.id]
  );

  const frame = useMemo<[number, number][]>(() => stops.map(s => [s.lat, s.lng]), [stops]);

  return <LiveMap markers={markers} routes={routes} frame={frame.length ? frame : null} fit={false} />;
}
