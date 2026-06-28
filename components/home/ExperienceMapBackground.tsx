"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getWorldMap, getWorldDotsSVG } from "@/lib/world-map-singleton";
import { useIsMobile } from "@/lib/useIsMobile";
import type { Experience } from "@/lib/types";

const FEATURED_COUNT = 16;

// Lucide's "Sparkles" icon path data, embedded natively as SVG so it lives
// inside the map's own coordinate space, matching the pattern used for the
// hotel cottage glyphs (HTML overlays don't line up against an SVG using
// preserveAspectRatio="slice").
const SPARKLE_PATH =
  "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z";

function SparkleGlyph({ scale }: { scale: number }) {
  return (
    <g transform={`scale(${scale}) translate(-12,-12)`}>
      <path d={SPARKLE_PATH} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/**
 * Hero background for the Experiences search tab — plots a featured set of
 * curated experiences as sparkle icons on the world dot map, in place of the
 * generic flights destination map. Each experience has its own precise
 * lat/lng, so every icon sits at its real-world location. Hovering turns an
 * icon gold; clicking goes straight to that experience's page — no
 * intermediate caption/popup, matching the hotel map's click behaviour.
 */
export default function ExperienceMapBackground({ experiences }: { experiences: Experience[] }) {
  const router = useRouter();
  const map = useMemo(() => getWorldMap(), []);
  const isMobile = useIsMobile();
  const fit = isMobile ? "meet" : "slice";
  const dotsSVG = useMemo(() => getWorldDotsSVG(fit), [fit]);
  const { width, height } = map.image;
  const [captionVisible, setCaptionVisible] = useState(true);

  useEffect(() => {
    setCaptionVisible(true);
    const timer = setTimeout(() => setCaptionVisible(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  const featured = useMemo(() => experiences.slice(0, FEATURED_COUNT), [experiences]);

  const points = useMemo(() => {
    const result: { exp: Experience; x: number; y: number }[] = [];
    for (const exp of featured) {
      if (exp.lat == null || exp.lng == null) continue;
      const pin = map.getPin({ lat: exp.lat, lng: exp.lng });
      if (pin) result.push({ exp, ...pin });
    }
    return result;
  }, [featured, map]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-[#0c1f17] via-[#163a28] to-[#081410]">
      <div
        className="absolute inset-0 w-full h-full [&>svg]:w-full [&>svg]:h-full"
        dangerouslySetInnerHTML={{ __html: dotsSVG }}
      />

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio={`xMidYMid ${fit}`}
      >
        {points.map(p => (
          <g
            key={p.exp.id}
            className="dest-dot hotel-dot"
            role="button"
            aria-label={`Go to ${p.exp.title}`}
            style={{ cursor: "pointer", pointerEvents: "auto" }}
            onClick={() => router.push(`/experiences/${p.exp.id}`)}
          >
            {/* Larger transparent hit-area — the sparkle's stroke-only
                outline is too thin on its own to reliably catch hover. */}
            <circle cx={p.x} cy={p.y} r={1.6} fill="transparent" />
            <g transform={`translate(${p.x}, ${p.y})`}>
              <SparkleGlyph scale={0.07} />
            </g>
          </g>
        ))}
      </svg>

      <div
        className="absolute top-28 right-6 sm:right-12 text-white/90 text-right max-w-xs transition-opacity duration-700 pointer-events-none"
        style={{ opacity: captionVisible ? 1 : 0 }}
      >
        <p className="text-[11px] text-white/60 font-light italic">
          Curated experiences worldwide — hover or click any to explore
        </p>
      </div>
    </div>
  );
}
