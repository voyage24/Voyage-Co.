"use client";

import { useMemo } from "react";
import { getWorldMap, getWorldDotsSVG } from "@/lib/world-map-singleton";
import { useIsMobile } from "@/lib/useIsMobile";
import { getCoords } from "@/lib/geo";
import { CITIES } from "@/lib/mock-data";
import type { City } from "@/lib/types";

// Airports plotted as clickable points whenever they aren't already the
// active From/To — lets the map double as a quick worldwide destination
// picker, not just a route visualiser.
const POPULAR_DESTINATION_CODES = [
  // South Asia & Middle East
  "DEL", "BOM", "BLR", "GOI", "DXB", "AUH", "RUH", "JED", "DOH", "IST", "TLV",
  // Africa
  "CAI", "JNB", "CPT", "NBO", "LOS", "CMN",
  // Europe
  "LHR", "CDG", "FRA", "MAD", "FCO", "AMS", "ZRH", "VIE", "ATH", "LIS", "PRG", "BUD", "ARN", "WAW",
  // The Americas
  "JFK", "LAX", "SFO", "ORD", "MIA", "YYZ", "YVR", "GRU", "EZE", "MEX",
  // Southeast & East Asia
  "SIN", "BKK", "KUL", "CGK", "MNL", "HKG", "ICN", "PEK", "PVG", "HND", "NRT", "TPE", "KTM", "CMB",
  // Oceania
  "SYD", "AKL", "DPS", "HNL",
];

// Lucide's "Plane" icon path data, embedded natively as SVG so it can live
// inside the map's own coordinate space (HTML overlays don't line up
// correctly against an SVG using preserveAspectRatio="slice").
const PLANE_PATH =
  "M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z";

function PlaneGlyph({ scale, color }: { scale: number; color: string }) {
  return (
    <g transform={`scale(${scale}) translate(-12,-12)`}>
      <path d={PLANE_PATH} fill={color} stroke={color} strokeWidth={0.5} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/**
 * Decorative world dot-map that plots the traveller's chosen From/To cities
 * and an animated flight-path arc between them, with a plane icon at each
 * airport and one plane continuously flying the route. The dot grid is
 * precomputed and shared (lib/world-map-singleton.ts) so there's no runtime
 * cost building the world geometry — only pin lookups happen on the client.
 */
export default function DestinationMap({
  from, to, onSelectDestination,
}: {
  from: City | null;
  to: City | null;
  onSelectDestination?: (city: City) => void;
}) {
  const map = useMemo(() => getWorldMap(), []);
  const isMobile = useIsMobile();
  const fit = "slice";
  const dotsSVG = useMemo(() => getWorldDotsSVG(fit, isMobile ? 0.6 : 0.32), [fit, isMobile]);

  // Popular destinations to plot as clickable points, excluding whichever
  // are already the active From/To (those get their own pin + plane glyph).
  const destinationPoints = useMemo(() => {
    return POPULAR_DESTINATION_CODES
      .filter(code => code !== from?.code && code !== to?.code)
      .map(code => {
        const city = CITIES.find(c => c.code === code);
        if (!city) return null;
        const [lat, lng] = getCoords(city.code, city.country);
        const pin = map.getPin({ lat, lng });
        return pin ? { city, ...pin } : null;
      })
      .filter((d): d is NonNullable<typeof d> => !!d);
  }, [map, from, to]);

  const fromPoint = useMemo(() => {
    if (!from) return null;
    const [lat, lng] = getCoords(from.code, from.country);
    return map.getPin({ lat, lng }) ?? null;
  }, [map, from]);

  const toPoint = useMemo(() => {
    if (!to) return null;
    const [lat, lng] = getCoords(to.code, to.country);
    return map.getPin({ lat, lng }) ?? null;
  }, [map, to]);

  const { width, height } = map.image;

  const arcPath = useMemo(() => {
    if (!fromPoint || !toPoint) return null;
    const { x: x1, y: y1 } = fromPoint;
    const { x: x2, y: y2 } = toPoint;
    if (x1 === x2 && y1 === y2) return null;
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const lift = Math.min(dist * 0.5, height * 0.4);
    return `M ${x1} ${y1} Q ${mx} ${my - lift} ${x2} ${y2}`;
  }, [fromPoint, toPoint, height]);

  const routeKey = `${from?.code ?? "none"}-${to?.code ?? "none"}`;

  return (
    <div className="absolute inset-0 overflow-hidden bg-ink">
      {/* Static dot grid */}
      <div
        className="absolute inset-0 w-full h-full [&>svg]:w-full [&>svg]:h-full"
        dangerouslySetInnerHTML={{ __html: dotsSVG }}
      />

      {/* Route overlay — re-keyed on every selection change so the pulse
          animation replays and the arc redraws for the new pair. */}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio={`xMidYMid ${fit}`}
      >
        {arcPath && (
          <path
            key={`arc-${routeKey}`}
            d={arcPath}
            fill="none"
            stroke="rgb(var(--gold-soft))"
            strokeWidth={0.4}
            strokeLinecap="round"
            strokeDasharray="3.2 2.4"
            className="route-arc"
          />
        )}
        {/* Endpoints are plain pins, not planes — only the single travelling
            plane below gets a plane glyph, so there's exactly one of them. */}
        {fromPoint && (
          <circle key={`from-${routeKey}`} cx={fromPoint.x} cy={fromPoint.y} r={0.6} fill="rgb(var(--gold-soft))" className="pulse-ring" />
        )}
        {toPoint && (
          <circle key={`to-${routeKey}`} cx={toPoint.x} cy={toPoint.y} r={0.6} fill="#f4f0e9" className="pulse-ring" />
        )}

        {/* The one plane, slowly and calmly making its way from origin to
            destination — kept unhurried rather than darting back and forth. */}
        {arcPath && (
          <g key={`flying-${routeKey}`}>
            <PlaneGlyph scale={0.09} color="#f4f0e9" />
            <animateMotion dur="18s" repeatCount="indefinite" path={arcPath} rotate="auto" />
          </g>
        )}

        {/* Other popular destinations — click one to set it as the
            destination in the search form below. */}
        {onSelectDestination && destinationPoints.map(({ city, x, y }) => (
          <g
            key={city.code}
            className="dest-dot"
            role="button"
            aria-label={`Set destination to ${city.name} (${city.code})`}
            style={{ cursor: "pointer", pointerEvents: "auto" }}
            onClick={() => onSelectDestination(city)}
          >
            <circle cx={x} cy={y} r={2.6} fill="transparent" />
            <circle cx={x} cy={y} r={0.32} fill="#f4f0e9" opacity={0.55} />
          </g>
        ))}
      </svg>
    </div>
  );
}
