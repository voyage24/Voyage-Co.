"use client";

import { useMemo } from "react";
import { getWorldMap, getWorldDotsSVG } from "@/lib/world-map-singleton";
import { getCoords } from "@/lib/geo";

/**
 * Compact version of the homepage destination map, scoped to a single
 * flight's route. Reuses the shared world dot-grid singleton so rendering
 * many of these (one per expanded flight card) stays cheap.
 */
export default function RouteMap({
  originCode, destinationCode,
}: {
  originCode: string;
  destinationCode: string;
}) {
  const map = useMemo(() => getWorldMap(), []);
  const dotsSVG = useMemo(() => getWorldDotsSVG(), []);

  const fromPoint = useMemo(() => {
    const [lat, lng] = getCoords(originCode);
    return map.getPin({ lat, lng }) ?? null;
  }, [map, originCode]);

  const toPoint = useMemo(() => {
    const [lat, lng] = getCoords(destinationCode);
    return map.getPin({ lat, lng }) ?? null;
  }, [map, destinationCode]);

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

  const routeKey = `${originCode}-${destinationCode}`;

  return (
    <div className="relative w-full h-20 sm:h-24 overflow-hidden bg-[#0e1620]">
      <div
        className="absolute inset-0 w-full h-full [&>svg]:w-full [&>svg]:h-full"
        dangerouslySetInnerHTML={{ __html: dotsSVG }}
      />
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        {arcPath && (
          <path
            key={`arc-${routeKey}`}
            d={arcPath}
            fill="none"
            stroke="#f97316"
            strokeWidth={0.5}
            strokeLinecap="round"
            strokeDasharray="3.2 2.4"
            className="route-arc"
          />
        )}
        {fromPoint && (
          <g key={`from-${routeKey}`}>
            <circle cx={fromPoint.x} cy={fromPoint.y} r={0.8} fill="rgb(var(--gold-soft))" className="pulse-ring" />
            <circle cx={fromPoint.x} cy={fromPoint.y} r={0.8} fill="rgb(var(--gold-soft))" />
          </g>
        )}
        {toPoint && (
          <g key={`to-${routeKey}`}>
            <circle cx={toPoint.x} cy={toPoint.y} r={0.8} fill="#f4f0e9" className="pulse-ring" />
            <circle cx={toPoint.x} cy={toPoint.y} r={0.8} fill="#f4f0e9" />
          </g>
        )}
      </svg>
    </div>
  );
}
