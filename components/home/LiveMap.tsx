"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useIsMobile } from "@/lib/useIsMobile";

// Shared, key-less Esri basemap — real satellite/terrain earth imagery
// (natural greens, blues and mountains) with a translucent place-name &
// boundaries reference overlay on top for orientation. Same imagery in both
// themes; dark mode is darkened in CSS so it reads as an elegant night view
// while staying natural.
const IMAGERY_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const LABELS_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";
const IMAGERY_ATTR = 'Imagery &copy; <a href="https://www.esri.com">Esri</a>, Maxar, Earthstar Geographics';

export type Tone = "gold" | "cream" | "amber" | "rose" | "teal" | "violet" | "emerald";
const TONE_HEX: Record<Tone, string> = {
  gold: "#d8c48f",
  cream: "#f4f0e9",
  amber: "#e9c98a",
  rose: "#e8a7ad",
  teal: "#7fd1c4",
  violet: "#bcaef0",
  emerald: "#8fd6a8",
};

export type Glyph = "dot" | "home" | "ship" | "train" | "compass" | "sparkle";
// Lucide glyph geometry, reused so each tab keeps its own identity on the map.
const GLYPH_SVG: Record<Glyph, string> = {
  dot: '<circle cx="12" cy="12" r="5.5" fill="currentColor" stroke="none"/>',
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  ship: '<path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/><path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/><path d="M12 10v4"/><path d="M12 2v3"/>',
  train: '<path d="M8 3.1V7a4 4 0 0 0 8 0V3.1"/><path d="m9 15-1-1"/><path d="m15 15 1-1"/><path d="M9 19c-2.8 0-5-2.2-5-5v-4a8 8 0 0 1 16 0v4c0 2.8-2.2 5-5 5Z"/><path d="m8 19-2 3"/><path d="m16 19 2 3"/>',
  compass: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
  sparkle: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>',
};

function markerHtml(glyph: Glyph, tone: Tone) {
  const filled = glyph === "dot";
  return (
    `<div class="vc-mk" style="color:${TONE_HEX[tone]}">` +
    `<svg viewBox="0 0 24 24" fill="${filled ? "currentColor" : "none"}" stroke="currentColor" ` +
    `stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${GLYPH_SVG[glyph]}</svg></div>`
  );
}

export type LiveMarker = {
  id: string;
  lat: number;
  lng: number;
  label?: string;
  glyph?: Glyph;
  tone?: Tone;
  onClick?: () => void;
};
export type LiveRoute = { id: string; points: [number, number][]; tone?: Tone };

/**
 * Reusable interactive Leaflet map for the homepage hero tabs. Plots markers
 * (styled per-tab glyphs from real coordinate data), optional route polylines,
 * and frames/flies to whatever the tab wants to show — all on the shared
 * theme-aware CARTO basemap. Leaflet is loaded lazily so it stays out of the
 * initial bundle and never runs during SSR.
 */
export default function LiveMap({
  markers,
  routes = [],
  fit = true,
  frame = null,
  flyTo = null,
  className = "",
}: {
  markers: LiveMarker[];
  routes?: LiveRoute[];
  fit?: boolean;
  frame?: [number, number][] | null;
  flyTo?: [number, number, number?] | null;
  className?: string;
}) {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const LRef = useRef<typeof L | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const [ready, setReady] = useState(false);

  // Signature of everything drawable so the redraw effect only fires on a real
  // change (marker arrays are recreated every render).
  const sig = useMemo(
    () =>
      JSON.stringify({
        m: markers.map(m => [m.id, m.lat, m.lng, m.tone, m.glyph]),
        r: routes.map(r => [r.id, r.points, r.tone]),
        fit,
        frame,
        flyTo,
      }),
    [markers, routes, fit, frame, flyTo]
  );

  useEffect(() => {
    let disposed = false;
    let map: L.Map | null = null;
    import("leaflet").then(mod => {
      const Lm = (mod.default ?? mod) as typeof L;
      if (disposed || !containerRef.current) return;
      LRef.current = Lm;
      map = Lm.map(containerRef.current, {
        center: [22, 12],
        zoom: isMobile ? 1 : 2,
        minZoom: 1,
        maxZoom: 12,
        scrollWheelZoom: false,
        worldCopyJump: true,
        attributionControl: true,
      });
      mapRef.current = map;
      // Base imagery, then the label/boundary overlay above it (kept above via
      // zIndex so it survives any later layer changes), then routes + markers.
      Lm.tileLayer(IMAGERY_URL, { attribution: IMAGERY_ATTR, detectRetina: false, maxZoom: 19, className: "vc-tiles-base", zIndex: 1 }).addTo(map);
      Lm.tileLayer(LABELS_URL, { detectRetina: false, maxZoom: 19, className: "vc-tiles-ref", zIndex: 2, opacity: 0.9 }).addTo(map);
      routeLayerRef.current = Lm.layerGroup().addTo(map);
      markerLayerRef.current = Lm.layerGroup().addTo(map);
      setTimeout(() => map?.invalidateSize(), 0);
      setReady(true);
    });
    return () => {
      disposed = true;
      map?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dark mode is handled purely in CSS (the imagery URL is theme-independent),
  // so there's no tile layer to swap on theme change.

  // Redraw markers/routes and (re)frame the view whenever the data changes.
  useEffect(() => {
    const Lm = LRef.current, map = mapRef.current;
    const mLayer = markerLayerRef.current, rLayer = routeLayerRef.current;
    if (!Lm || !map || !mLayer || !rLayer) return;

    rLayer.clearLayers();
    for (const r of routes) {
      if (r.points.length < 2) continue;
      Lm.polyline(r.points, {
        color: TONE_HEX[r.tone ?? "gold"],
        weight: 2,
        opacity: 0.85,
        dashArray: "6 8",
      }).addTo(rLayer);
    }

    mLayer.clearLayers();
    for (const m of markers) {
      const icon = Lm.divIcon({
        html: markerHtml(m.glyph ?? "dot", m.tone ?? "gold"),
        className: "vc-mk-wrap",
        iconSize: [26, 26],
        iconAnchor: [13, 13],
        tooltipAnchor: [0, -11],
      });
      const mk = Lm.marker([m.lat, m.lng], { icon, keyboard: false, interactive: !!m.onClick || !!m.label });
      if (m.label) mk.bindTooltip(m.label, { direction: "top", opacity: 0.95 });
      if (m.onClick) { mk.on("click", m.onClick); }
      mk.addTo(mLayer);
    }

    const coords = markers.map(m => [m.lat, m.lng] as [number, number]);
    const flyOne = (c: [number, number], z: number) => map.flyTo(c, z, { duration: 1.1 });
    if (flyTo) {
      flyOne([flyTo[0], flyTo[1]], flyTo[2] ?? (isMobile ? 5 : 6));
    } else if (frame && frame.length) {
      frame.length === 1
        ? flyOne(frame[0], isMobile ? 5 : 6)
        : map.flyToBounds(Lm.latLngBounds(frame).pad(0.35), { duration: 1.1, maxZoom: 7 });
    } else if (fit && coords.length) {
      coords.length === 1
        ? flyOne(coords[0], isMobile ? 5 : 6)
        : map.flyToBounds(Lm.latLngBounds(coords).pad(0.25), { duration: 1.1, maxZoom: 8 });
    } else {
      map.flyTo([22, 12], isMobile ? 1 : 2, { duration: 1.0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig, ready, isMobile]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 h-full w-full vc-live-map ${className}`}
      style={{ background: "radial-gradient(140% 115% at 50% 55%, #1c3a4a 0%, #122a37 55%, #0b1a24 100%)" }}
    />
  );
}
