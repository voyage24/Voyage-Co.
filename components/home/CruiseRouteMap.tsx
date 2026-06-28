"use client";

import { useMemo } from "react";
import { getWorldMap, getWorldDotsSVG } from "@/lib/world-map-singleton";
import { useIsMobile } from "@/lib/useIsMobile";
import { getPortCoords } from "@/lib/cruise-ports";
import type { Cruise } from "@/lib/types";

// Lucide's "Ship" icon path data, embedded natively as SVG so it can live
// inside the map's own coordinate space (HTML overlays don't line up
// correctly against an SVG using preserveAspectRatio="slice").
const SHIP_PATHS = [
  "M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",
  "M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76",
  "M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6",
  "M12 10v4",
  "M12 2v3",
];

function ShipGlyph({ scale, color }: { scale: number; color: string }) {
  return (
    <g transform={`scale(${scale}) translate(-12,-12)`}>
      {SHIP_PATHS.map(d => (
        <path key={d} d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </g>
  );
}

/**
 * Plots a cruise's full itinerary — departure port through every port of
 * call — as a chain of arcs on the dotted world map, with a ship icon
 * marking each port and one ship continuously sailing the full route.
 */
export default function CruiseRouteMap({ cruise }: { cruise: Cruise }) {
  const map = useMemo(() => getWorldMap(), []);
  const isMobile = useIsMobile();
  const fit = "slice";
  const dotsSVG = useMemo(() => getWorldDotsSVG(fit, isMobile ? 0.6 : 0.32), [fit, isMobile]);
  const { width, height } = map.image;

  const stops = useMemo(() => {
    const names = [cruise.departurePort, ...cruise.ports];
    return names
      .map(name => {
        const coords = getPortCoords(name);
        if (!coords) return null;
        const [lat, lng] = coords;
        const pin = map.getPin({ lat, lng });
        return pin ? { name, ...pin } : null;
      })
      .filter((s): s is NonNullable<typeof s> => !!s);
  }, [cruise, map]);

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
      out.push({ key: `${cruise.id}-leg${i}`, d: `M ${a.x} ${a.y} Q ${mx} ${my - lift} ${b.x} ${b.y}` });
    }
    return out;
  }, [stops, height, cruise.id]);

  const fullRoutePath = useMemo(() => legs.map(l => l.d).join(" "), [legs]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-[#051420] via-[#0d2c42] to-[#072433]">
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
          const shipScale = isEndpoint ? 0.085 : 0.065;
          return (
            <g key={`${cruise.id}-stop${i}`}>
              {isEndpoint && (
                <circle cx={stop.x} cy={stop.y} r={ringR} fill={color} className="pulse-ring" />
              )}
              <g transform={`translate(${stop.x}, ${stop.y})`}>
                <ShipGlyph scale={shipScale} color={color} />
              </g>
            </g>
          );
        })}

        {/* A ship slowly, calmly sailing the full itinerary — kept
            unhurried rather than racing the route. */}
        {fullRoutePath && (
          <g>
            <ShipGlyph scale={0.09} color="#f4f0e9" />
            <animateMotion dur="26s" repeatCount="indefinite" path={fullRoutePath} rotate="auto" />
          </g>
        )}
      </svg>
    </div>
  );
}
