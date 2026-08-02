"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import OutstationCabCard from "@/components/cards/OutstationCabCard";
import Reveal from "@/components/ui/Reveal";
import type { OutstationCab } from "@/lib/types";

const TRIP_TYPES = ["All", "One-way", "Round-trip"];

export default function OutstationCabsPageClient({ cabs }: { cabs: OutstationCab[] }) {
  const [tripType, setTripType] = useState("All");
  const [sortBy, setSortBy] = useState("Price: Low");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // Pre-fill from URL search params (e.g. arriving from the hero search widget).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const f = params.get("from");
    const t = params.get("to");
    const tt = params.get("tripType");
    if (f) setFrom(f);
    if (t) setTo(t);
    if (tt) {
      const found = TRIP_TYPES.find(x => x.toLowerCase() === tt.toLowerCase());
      if (found) setTripType(found);
    }
  }, []);

  const filtered = cabs
    .filter(c => tripType === "All" || c.tripType === tripType)
    .filter(c => !from || c.originCity.toLowerCase() === from.toLowerCase())
    .filter(c => !to || c.destinationCity.toLowerCase() === to.toLowerCase())
    .sort((a, b) => (sortBy === "Price: Low" ? a.price - b.price : b.price - a.price));

  const pill = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-xs font-normal tracking-[0.08em] uppercase border transition-colors ${active ? "bg-ink border-ink text-page" : "border-line text-ink-muted hover:border-ink/40"}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
      <div className="relative rounded-2xl overflow-hidden p-6 sm:p-10 mb-10 border border-vc-700 min-h-[280px] flex flex-col justify-center">
        <Image
          src="https://images.unsplash.com/photo-1764605206511-7a649d9df63b?w=1600&h=800&fit=crop"
          alt="" fill sizes="100vw" priority className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-vc-950/90 via-vc-950/70 to-vc-950/30" />
        <div className="relative">
          <p className="text-[10px] font-normal uppercase tracking-[0.3em] text-[#b09e74] mb-3">Transport &amp; Stays</p>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#ece7dd] mb-3">Outstation Cabs</h1>
          <p className="text-[#9aa4ab] max-w-lg font-light leading-relaxed">
            Intercity journeys with a private driver — one-way or round-trip, at a fixed, all-inclusive fare.
          </p>
        </div>
      </div>

      <div className="mb-8">
        <p className="text-[11px] tracking-[0.14em] uppercase text-ink-faint mb-2">Trip Type</p>
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {TRIP_TYPES.map(t => (
            <button key={t} onClick={() => setTripType(t)} className={`${pill(tripType === t)} whitespace-nowrap shrink-0`}>{t}</button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-5 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <p className="text-sm text-ink-muted font-light whitespace-nowrap shrink-0">{filtered.length} routes</p>
          {(from || to) && (
            <button onClick={() => { setFrom(""); setTo(""); }} className="text-[11px] tracking-wide px-2.5 py-1 rounded-full bg-panel-soft text-ink-muted hover:text-ink whitespace-nowrap shrink-0">
              {from || "Any"} → {to || "Any"} ×
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
          filtered.map(cab => <OutstationCabCard key={cab.id} cab={cab} />)
        ) : (
          <div className="col-span-3 text-center py-20">
            <p className="font-serif text-2xl font-light text-ink mb-2">No routes match those filters.</p>
            <button onClick={() => { setTripType("All"); setFrom(""); setTo(""); }} className="mt-3 text-xs tracking-[0.12em] uppercase text-gold hover:underline">
              Clear filters
            </button>
          </div>
        )}
      </Reveal>
    </div>
  );
}
