"use client";

import { useState } from "react";
import Image from "next/image";
import AirportCabCard from "@/components/cards/AirportCabCard";
import Reveal from "@/components/ui/Reveal";
import type { AirportCab } from "@/lib/types";

const CATEGORIES = ["All", "Sedan", "SUV", "Luxury Sedan", "Van"];

export default function AirportCabsPageClient({ cabs }: { cabs: AirportCab[] }) {
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Price: Low");

  const filtered = cabs
    .filter(c => category === "All" || c.vehicleType === category)
    .sort((a, b) => (sortBy === "Price: Low" ? a.price - b.price : b.price - a.price));

  const pill = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-xs font-normal tracking-[0.08em] uppercase border transition-colors ${active ? "bg-ink border-ink text-page" : "border-line text-ink-muted hover:border-ink/40"}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
      <div className="relative rounded-2xl overflow-hidden p-6 sm:p-10 mb-10 border border-vc-700 min-h-[280px] flex flex-col justify-center">
        <Image
          src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1600&h=800&fit=crop"
          alt="" fill sizes="100vw" priority className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-vc-950/90 via-vc-950/70 to-vc-950/30" />
        <div className="relative">
          <p className="text-[10px] font-normal uppercase tracking-[0.3em] text-[#b09e74] mb-3">Transport &amp; Stays</p>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#ece7dd] mb-3">Airport Cabs</h1>
          <p className="text-[#9aa4ab] max-w-lg font-light leading-relaxed">
            A private chauffeur waiting at arrivals — fixed-price transfers, flight tracking and a meet &amp; greet included.
          </p>
        </div>
      </div>

      <div className="mb-8">
        <p className="text-[11px] tracking-[0.14em] uppercase text-ink-faint mb-2">Vehicle</p>
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} className={`${pill(category === c)} whitespace-nowrap shrink-0`}>{c}</button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-5 gap-3">
        <p className="text-sm text-ink-muted font-light whitespace-nowrap shrink-0">{filtered.length} transfers</p>
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
          filtered.map(cab => <AirportCabCard key={cab.id} cab={cab} />)
        ) : (
          <div className="col-span-3 text-center py-20">
            <p className="font-serif text-2xl font-light text-ink mb-2">No transfers match those filters.</p>
            <button onClick={() => setCategory("All")} className="mt-3 text-xs tracking-[0.12em] uppercase text-gold hover:underline">
              Clear filters
            </button>
          </div>
        )}
      </Reveal>
    </div>
  );
}
