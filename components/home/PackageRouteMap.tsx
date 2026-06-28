"use client";

import { useMemo } from "react";
import { getWorldMap, getWorldDotsSVG } from "@/lib/world-map-singleton";
import { useIsMobile } from "@/lib/useIsMobile";
import { getPackageDestinationCoords } from "@/lib/package-destinations";
import type { Package } from "@/lib/types";

// Lucide's "Compass" icon path data, embedded natively as SVG so it can
// live inside the map's own coordinate space (HTML overlays don't line up
// correctly against an SVG using preserveAspectRatio="slice"). A compass
// fits the "bespoke journey" theme distinctly from the plane/ship/train
// glyphs used on the other tabs.
function CompassGlyph({ scale, color }: { scale: number; color: string }) {
  return (
    <g transform={`scale(${scale}) translate(-12,-12)`}>
      <circle cx={12} cy={12} r={10} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill={color} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/**
 * Plots a bespoke journey's full multi-city itinerary on the dotted world
 * map, with a compass icon marking each stop and one compass continuously
 * travelling the full route — same technique as the cruise/rail maps, so
 * the homepage's Bespoke Journeys tab reflects the actual curated
 * itineraries on /packages instead of falling back to the flights map.
 */
export default function PackageRouteMap({ pkg }: { pkg: Package }) {
  const map = useMemo(() => getWorldMap(), []);
  const isMobile = useIsMobile();
  const fit = "slice";
  const dotsSVG = useMemo(() => getWorldDotsSVG(fit, isMobile ? 0.6 : 0.32), [fit, isMobile]);
  const { width, height } = map.image;

  const stops = useMemo(() => {
    return pkg.destinations
      .map(name => {
        const coords = getPackageDestinationCoords(name);
        if (!coords) return null;
        const [lat, lng] = coords;
        const pin = map.getPin({ lat, lng });
        return pin ? { name, ...pin } : null;
      })
      .filter((s): s is NonNullable<typeof s> => !!s);
  }, [pkg, map]);

  const legs = useMemo(() => {
    const out: { key: string; d: string }[] = [];
    for (let i = 0; i < stops.length - 1; i++) {
      const a = stops[i];
      const b = stops[i + 1];
      if (a.x === b.x && a.y === b.y) continue;
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      const dist = Math.hypot(b.x - a.x, b.y - a.y);
      const lift = Math.min(dist * 0.5, height * 0.4);
      out.push({ key: `${pkg.id}-leg${i}`, d: `M ${a.x} ${a.y} Q ${mx} ${my - lift} ${b.x} ${b.y}` });
    }
    return out;
  }, [stops, height, pkg.id]);

  const fullRoutePath = useMemo(() => legs.map(l => l.d).join(" "), [legs]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-[#1c1208] via-[#2b1d0f] to-[#140d06]">
      <div
        className="absolute inset-0 w-full h-full [&>svg]:w-full [&>svg]:h-full"
        dangerouslySetInnerHTML={{ __html: dotsSVG }}
      />

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio={`xMidYMid ${fit}`}
      >
        {legs.map(leg => (
          <path
            key={leg.key}
            d={leg.d}
            fill="none"
            stroke="rgb(var(--gold-soft))"
            strokeWidth={0.4}
            strokeLinecap="round"
            strokeDasharray="3.2 2.4"
            className="route-arc"
          />
        ))}

        {stops.map((stop, i) => {
          const isEndpoint = i === 0 || i === stops.length - 1;
          const color = i === stops.length - 1 ? "#f4f0e9" : "rgb(var(--gold-soft))";
          const ringR = isEndpoint ? 0.6 : 0.4;
          const glyphScale = isEndpoint ? 0.085 : 0.065;
          return (
            <g key={`${pkg.id}-stop${i}`}>
              {isEndpoint && (
                <circle cx={stop.x} cy={stop.y} r={ringR} fill={color} className="pulse-ring" />
              )}
              <g transform={`translate(${stop.x}, ${stop.y})`}>
                <CompassGlyph scale={glyphScale} color={color} />
              </g>
            </g>
          );
        })}

        {/* A compass slowly, calmly travelling the full itinerary — kept
            unhurried rather than racing the route. */}
        {fullRoutePath && (
          <g>
            <CompassGlyph scale={0.09} color="#f4f0e9" />
            <animateMotion dur="24s" repeatCount="indefinite" path={fullRoutePath} rotate="auto" />
          </g>
        )}
      </svg>
    </div>
  );
}
