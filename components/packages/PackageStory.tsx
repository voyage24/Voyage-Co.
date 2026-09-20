"use client";

import Image from "next/image";
import { Clock, MapPin, CheckCircle, Users } from "lucide-react";
import T from "@/components/ui/T";
import ScrollStory from "@/components/ui/ScrollStory";

// The package page's hero → highlights → inclusions → itinerary, rebuilt as
// a pinned, scroll-scrubbed sequence: as the visitor scrolls, the journey's
// highlights, inclusions and day-by-day itinerary build themselves up one at
// a time over the hero image, instead of sitting fully-formed in static
// cards. See components/ui/ScrollStory.tsx for the underlying mechanics.
export default function PackageStory({
  image,
  badge,
  title,
  subtitle,
  destinations,
  duration,
  highlights,
  includes,
  days,
}: {
  image: string;
  badge?: string | null;
  title: string;
  subtitle: string;
  destinations: string[];
  duration: string;
  highlights: string[];
  includes: string[];
  days: number;
}) {
  const itineraryDays = Math.min(days, 8);

  return (
    <ScrollStory
      className="mb-6"
      background={
        <>
          <Image src={image} alt={title} fill sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover ken-burns" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-vc-950/85 via-vc-950/25 to-vc-950/10" />
          {badge && (
            <span className="absolute top-4 left-4 text-[9px] font-medium tracking-[0.15em] uppercase text-gold border border-gold/50 bg-vc-950/70 backdrop-blur-sm px-3 py-1 rounded-sm">
              {badge}
            </span>
          )}
        </>
      }
      layers={[
        {
          // Layer 1 — Arrival: the journey's name is visible immediately on
          // load (no internal gating) — only the crossfade to layer 2 is
          // scroll-driven, so the page never opens on a bare image.
          range: [0, 0.25],
          render: () => (
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
              <div className="flex items-center gap-2 text-sm text-white/80 mb-2 font-light">
                <MapPin size={14} className="text-gold" />
                {destinations.join(" · ")}
              </div>
              <p className="text-[11px] tracking-[0.18em] uppercase text-gold mb-1">{subtitle}</p>
              <h1 className="font-serif text-3xl sm:text-4xl font-light text-white mb-3">{title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/80 font-light">
                <span className="flex items-center gap-1.5"><Clock size={14} className="text-gold" /> {duration}</span>
                <span className="flex items-center gap-1.5"><Users size={14} className="text-gold" /> <T k="detail.privateTailored" /></span>
              </div>
            </div>
          ),
        },
        {
          // Layer 2 — Highlights build up one after another.
          range: [0.25, 0.5],
          render: (p) => (
            <div className="absolute inset-0 flex items-end sm:items-center justify-center p-6 sm:p-10">
              <div className="w-full max-w-md bg-vc-950/70 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-7">
                <h2 className="font-serif text-xl font-light text-white mb-4"><T k="detail.highlights" /></h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {highlights.map((h, i) => {
                    const shown = Math.min(1, Math.max(0, p * highlights.length - i));
                    return (
                      <div
                        key={h}
                        className="flex items-center gap-2 text-sm text-white/85 font-light"
                        style={{ opacity: shown, transform: `translateX(${(1 - shown) * 12}px)` }}
                      >
                        <span className="w-5 h-5 rounded-full border border-gold/40 bg-gold/10 text-gold flex items-center justify-center shrink-0 text-[10px]">★</span>
                        {h}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ),
        },
        {
          // Layer 3 — Inclusions build up icon-by-icon.
          range: [0.5, 0.75],
          render: (p) => (
            <div className="absolute inset-0 flex items-end sm:items-center justify-center p-6 sm:p-10">
              <div className="w-full max-w-md bg-vc-950/70 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-7">
                <h2 className="font-serif text-xl font-light text-white mb-4"><T k="detail.whatsIncluded" /></h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {includes.map((inc, i) => {
                    const shown = Math.min(1, Math.max(0, p * includes.length - i));
                    return (
                      <div
                        key={inc}
                        className="flex items-center gap-2 text-sm text-white/85 font-light"
                        style={{ opacity: shown, transform: `translateX(${(1 - shown) * 12}px)` }}
                      >
                        <CheckCircle size={15} className="text-gold shrink-0" />
                        {inc}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ),
        },
        {
          // Layer 4 — the day-by-day itinerary draws itself in.
          range: [0.75, 1],
          render: (p) => (
            <div className="absolute inset-0 flex items-end sm:items-center justify-center p-6 sm:p-10">
              <div className="w-full max-w-md bg-vc-950/70 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-7 max-h-[85%] overflow-y-auto">
                <h2 className="font-serif text-xl font-light text-white mb-5"><T k="detail.sampleItinerary" /></h2>
                <div className="space-y-4">
                  {Array.from({ length: itineraryDays }, (_, i) => {
                    const shown = Math.min(1, Math.max(0, p * itineraryDays - i));
                    return (
                      <div key={i} className="flex gap-4" style={{ opacity: shown, transform: `translateY(${(1 - shown) * 10}px)` }}>
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full border border-gold/50 text-gold text-xs font-medium flex items-center justify-center shrink-0">
                            {i + 1}
                          </div>
                          {i < itineraryDays - 1 && (
                            <div className="w-px flex-1 mt-1 bg-white/15 relative overflow-hidden">
                              <div className="absolute inset-x-0 top-0 bg-gold" style={{ height: `${shown * 100}%` }} />
                            </div>
                          )}
                        </div>
                        <div className="pb-4">
                          <p className="font-medium text-white text-sm"><T k="detail.day" /> {i + 1} — {destinations[i % destinations.length]}</p>
                          <p className="text-xs text-white/70 mt-1 font-light leading-relaxed">
                            {i === 0
                              ? <T k="detail.packageItineraryFirst" />
                              : i === itineraryDays - 1
                                ? <T k="detail.packageItineraryLast" />
                                : <T k="detail.packageItineraryMiddle" />}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ),
        },
      ]}
    />
  );
}
