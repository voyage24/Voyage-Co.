"use client";

import { useMemo } from "react";
import LiveMap, { type LiveMarker, type LiveRoute } from "@/components/home/LiveMap";
import { getPackageDestinationCoords } from "@/lib/package-destinations";
import type { Package } from "@/lib/types";

/**
 * Plots a bespoke journey's full multi-city itinerary on the live world map:
 * a compass marker at each stop, a dashed route line joining them, framed to
 * the itinerary.
 */
export default function PackageRouteMap({ pkg }: { pkg: Package }) {
  const stops = useMemo(() => {
    return pkg.destinations
      .map(name => {
        const coords = getPackageDestinationCoords(name);
        return coords ? { name, lat: coords[0], lng: coords[1] } : null;
      })
      .filter((s): s is { name: string; lat: number; lng: number } => !!s);
  }, [pkg]);

  const markers = useMemo<LiveMarker[]>(
    () =>
      stops.map((s, i) => ({
        id: `${pkg.id}-${i}`,
        lat: s.lat,
        lng: s.lng,
        label: s.name,
        glyph: "compass",
        tone: i === stops.length - 1 ? "cream" : "amber",
      })),
    [stops, pkg.id]
  );

  const routes = useMemo<LiveRoute[]>(
    () => (stops.length > 1 ? [{ id: pkg.id, points: stops.map(s => [s.lat, s.lng] as [number, number]), tone: "amber" }] : []),
    [stops, pkg.id]
  );

  const frame = useMemo<[number, number][]>(() => stops.map(s => [s.lat, s.lng]), [stops]);

  return <LiveMap markers={markers} routes={routes} frame={frame.length ? frame : null} fit={false} />;
}
