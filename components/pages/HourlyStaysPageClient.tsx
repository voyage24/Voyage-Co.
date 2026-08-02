"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import HourlyStayCard from "@/components/cards/HourlyStayCard";
import Reveal from "@/components/ui/Reveal";
import type { HourlyStay } from "@/lib/types";

const DURATIONS = ["All", 3, 6, 12] as const;

export default function HourlyStaysPageClient({ stays }: { stays: HourlyStay[] }) {
  const [hours, setHours] = useState<"All" | 3 | 6 | 12>("All");
  const [sortBy, setSortBy] = useState("Price: Low");
  const [city, setCity] = useState("");

  // Pre-fill from URL search params (e.g. arriving from the hero search widget).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get("city");
    const h = params.get("hours");
    if (c) setCity(c);
    if (h === "3" || h === "6" || h === "12") setHours(Number(h) as 3 | 6 | 12);
  }, []);

  const filtered = stays
    .filter(s => hours === "All" || s.hours === hours)
    .filter(s => !city || s.city.toLowerCase() === city.toLowerCase())
    .sort((a, b) => (sortBy === "Price: Low" ? a.price - b.price : b.price - a.price));

  const pill = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-xs font-normal tracking-[0.08em] uppercase border transition-colors ${active ? "bg-ink border-ink text-page" : "border-line text-ink-muted hover:border-ink/40"}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
      <div className="relative rounded-2xl overflow-hidden p-6 sm:p-10 mb-10 border border-vc-700 min-h-[280px] flex flex-col justify-center">
        <Image
          src="https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1600&h=800&fit=crop"
          alt="" fill sizes="100vw" priority className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-vc-950/90 via-vc-950/70 to-vc-950/30" />
        <div className="relative">
          <p className="text-[10px] font-normal uppercase tracking-[0.3em] text-[#b09e74] mb-3">Transport &amp; Stays</p>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#ece7dd] mb-3">Hourly Stays</h1>
          <p className="text-[#9aa4ab] max-w-lg font-light leading-relaxed">
            Day-use rooms by the hour — freshen up, rest between flights, or take a few hours in comfort.
          </p>
        </div>
      </div>

      <div className="mb-8">
        <p className="text-[11px] tracking-[0.14em] uppercase text-ink-faint mb-2">Duration</p>
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {DURATIONS.map(d => (
            <button key={d} onClick={() => setHours(d)} className={`${pill(hours === d)} whitespace-nowrap shrink-0`}>{d === "All" ? "All" : `${d} hours`}</button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-5 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <p className="text-sm text-ink-muted font-light whitespace-nowrap shrink-0">{filtered.length} stays</p>
          {city && (
            <button onClick={() => setCity("")} className="text-[11px] tracking-wide px-2.5 py-1 rounded-full bg-panel-soft text-ink-muted hover:text-ink whitespace-nowrap shrink-0">
              in {city} ×
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-none min-w-0">
          {(["Price: Low", "Price: High"] as const).map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-normal tracking-wide transition-colors whitespace-nowrap shrink-0 ${sortBy === s ? "bg-ink text-page" : "bg-panel-soft text-ink-muted hover:text-ink"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <Reveal soft className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length > 0 ? (
          filtered.map(stay => <HourlyStayCard key={stay.id} stay={stay} />)
        ) : (
          <div className="col-span-3 text-center py-20">
            <p className="font-serif text-2xl font-light text-ink mb-2">No stays match those filters.</p>
            <button onClick={() => { setHours("All"); setCity(""); }} className="mt-3 text-xs tracking-[0.12em] uppercase text-gold hover:underline">
              Clear filters
            </button>
          </div>
        )}
      </Reveal>
    </div>
  );
}
