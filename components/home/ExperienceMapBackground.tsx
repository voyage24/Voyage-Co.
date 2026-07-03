"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import LiveMap, { type LiveMarker } from "@/components/home/LiveMap";
import type { Experience } from "@/lib/types";

const FEATURED_COUNT = 16;

/**
 * Hero background for the Experiences search tab — plots a featured set of
 * curated experiences as sparkle markers on the live world map, each at its
 * real lat/lng. Clicking one goes straight to that experience's page.
 */
export default function ExperienceMapBackground({ experiences }: { experiences: Experience[] }) {
  const router = useRouter();
  const [captionVisible, setCaptionVisible] = useState(true);

  useEffect(() => {
    setCaptionVisible(true);
    const timer = setTimeout(() => setCaptionVisible(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  const markers = useMemo<LiveMarker[]>(
    () =>
      experiences
        .slice(0, FEATURED_COUNT)
        .filter(e => e.lat != null && e.lng != null)
        .map(e => ({
          id: e.id,
          lat: e.lat!,
          lng: e.lng!,
          label: e.title,
          glyph: "sparkle",
          tone: "emerald",
          onClick: () => router.push(`/experiences/${e.id}`),
        })),
    [experiences, router]
  );

  return (
    <div className="absolute inset-0 overflow-hidden">
      <LiveMap markers={markers} fit />

      <div
        className="absolute top-28 right-6 sm:right-12 text-white/90 text-right max-w-xs transition-opacity duration-700 pointer-events-none z-[2]"
        style={{ opacity: captionVisible ? 1 : 0 }}
      >
        <p className="text-[11px] text-white/70 font-light italic drop-shadow">
          Curated experiences worldwide — hover or click any to explore
        </p>
      </div>
    </div>
  );
}
