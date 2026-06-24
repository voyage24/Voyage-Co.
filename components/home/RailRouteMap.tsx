"use client";

import { useMemo } from "react";
import { getIndiaMap, getIndiaDotsSVG } from "@/lib/india-map-singleton";
import { getStationCoords } from "@/lib/rail-stations";
import type { Train } from "@/lib/types";

// Lucide's "TrainFront" icon path data, embedded natively as SVG so it can
// live inside the map's own coordinate space (HTML overlays don't line up
// correctly against an SVG using preserveAspectRatio="slice").
const TRAIN_PATHS = [
  "M8 3.1V7a4 4 0 0 0 8 0V3.1",
  "m9 15-1-1",
  "m15 15 1-1",
  "M9 19c-2.8 0-5-2.2-5-5v-4a8 8 0 0 1 16 0v4c0 2.8-2.2 5-5 5Z",
  "m8 19-2 3",
  "m16 19 2 3",
];

function TrainGlyph({ scale, color }: { scale: number; color: string }) {
  return (
    <g transform={`scale(${scale}) translate(-12,-12)`}>
      {TRAIN_PATHS.map(d => (
        <path key={d} d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </g>
  );
}

/**
 * Plots a domestic rail journey — origin to destination station — on a
 * zoomed-in India-only dot map (the full world map is far too compact for
 * routes this short), with a train icon at each terminus and one train
 * continuously running the route.
 */
export default function RailRouteMap({ train }: { train: Train }) {
  const map = useMemo(() => getIndiaMap(), []);
  const dotsSVG = useMemo(() => getIndiaDotsSVG(), []);
  const { width, height } = map.image;

  const fromPoint = useMemo(() => {
    const coords = getStationCoords(train.origin);
    if (!coords) return null;
    const [lat, lng] = coords;
    return map.getPin({ lat, lng }) ?? null;
  }, [map, train.origin]);

  const toPoint = useMemo(() => {
    const coords = getStationCoords(train.destination);
    if (!coords) return null;
    const [lat, lng] = coords;
    return map.getPin({ lat, lng }) ?? null;
  }, [map, train.destination]);

  const routePath = useMemo(() => {
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

  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-[#13101f] via-[#211c38] to-[#0b0915]">
      <div
        className="absolute inset-0 w-full h-full [&>svg]:w-full [&>svg]:h-full"
        dangerouslySetInnerHTML={{ __html: dotsSVG }}
      />

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        {routePath && (
          <path
            d={routePath}
            fill="none"
            stroke="rgb(var(--gold-soft))"
            strokeWidth={0.4}
            strokeLinecap="round"
            strokeDasharray="3.2 2.4"
            className="route-arc"
          />
        )}

        {fromPoint && (
          <g>
            <circle cx={fromPoint.x} cy={fromPoint.y} r={0.7} fill="rgb(var(--gold-soft))" className="pulse-ring" />
            <g transform={`translate(${fromPoint.x}, ${fromPoint.y})`}>
              <TrainGlyph scale={0.1} color="rgb(var(--gold-soft))" />
            </g>
          </g>
        )}
        {toPoint && (
          <g>
            <circle cx={toPoint.x} cy={toPoint.y} r={0.7} fill="#f4f0e9" className="pulse-ring" />
            <g transform={`translate(${toPoint.x}, ${toPoint.y})`}>
              <TrainGlyph scale={0.1} color="#f4f0e9" />
            </g>
          </g>
        )}

        {/* A train slowly, calmly running the route — kept unhurried. */}
        {routePath && (
          <g>
            <TrainGlyph scale={0.11} color="#f4f0e9" />
            <animateMotion dur="14s" repeatCount="indefinite" path={routePath} rotate="auto" />
          </g>
        )}
      </svg>
    </div>
  );
}
