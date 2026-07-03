"use client";

import { useMemo } from "react";
import LiveMap, { type LiveMarker, type LiveRoute } from "@/components/home/LiveMap";
import { getStationCoords } from "@/lib/rail-stations";
import type { Train } from "@/lib/types";

/**
 * Plots a domestic rail journey — origin to destination station — on the live
 * map, a train marker at each terminus and a dashed line between them, framed
 * to the route.
 */
export default function RailRouteMap({ train }: { train: Train }) {
  const stops = useMemo(() => {
    const from = getStationCoords(train.origin);
    const to = getStationCoords(train.destination);
    const out: { name: string; lat: number; lng: number; end?: boolean }[] = [];
    if (from) out.push({ name: train.originCity, lat: from[0], lng: from[1] });
    if (to) out.push({ name: train.destinationCity, lat: to[0], lng: to[1], end: true });
    return out;
  }, [train.origin, train.destination, train.originCity, train.destinationCity]);

  const markers = useMemo<LiveMarker[]>(
    () => stops.map((s, i) => ({ id: `${train.id}-${i}`, lat: s.lat, lng: s.lng, label: s.name, glyph: "train", tone: s.end ? "cream" : "violet" })),
    [stops, train.id]
  );

  const routes = useMemo<LiveRoute[]>(
    () => (stops.length > 1 ? [{ id: train.id, points: stops.map(s => [s.lat, s.lng] as [number, number]), tone: "violet" }] : []),
    [stops, train.id]
  );

  const frame = useMemo<[number, number][]>(() => stops.map(s => [s.lat, s.lng]), [stops]);

  return <LiveMap markers={markers} routes={routes} frame={frame.length ? frame : null} fit={false} />;
}
