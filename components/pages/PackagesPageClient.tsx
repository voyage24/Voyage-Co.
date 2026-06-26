"use client";

import { useState } from "react";
import Image from "next/image";
import PackageCard from "@/components/cards/PackageCard";
import type { Package } from "@/lib/types";
import { useLanguage } from "@/components/providers/LanguageProvider";

const CATEGORIES = ["All", "Heritage", "Beach & Culture", "Luxury European", "Spiritual", "Safari & Beach", "Adventure", "Desert Expedition", "Island Escape"];

export default function PackagesPageClient({ packages }: { packages: Package[] }) {
  const { t } = useLanguage();
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Price: Low");

  const filtered = packages
    .filter(p => category === "All" || p.category === category)
    .sort((a, b) => {
      if (sortBy === "Price: Low") return a.pricePerPerson - b.pricePerPerson;
      if (sortBy === "Price: High") return b.pricePerPerson - a.pricePerPerson;
      return 0;
    });

  const pill = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-xs font-normal tracking-[0.08em] uppercase border transition-colors ${active ? "bg-ink border-ink text-page" : "border-line text-ink-muted hover:border-ink/40"}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
      {/* Hero banner — a sweeping, unbranded travel image stands in for the
          worldwide spread of journeys below, rather than a flat color
          block; same image + gradient-overlay technique used on the
          individual hotel/package detail pages, for consistency. */}
      <div className="relative rounded-2xl overflow-hidden p-6 sm:p-10 mb-10 border border-vc-700 min-h-[280px] flex flex-col justify-center">
        <Image
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&h=800&fit=crop"
          alt=""
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-vc-950/90 via-vc-950/70 to-vc-950/30" />
        <div className="relative">
          <p className="text-[10px] font-normal uppercase tracking-[0.3em] text-[#b09e74] mb-3">{t("searchTabs.packages")}</p>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#ece7dd] mb-3">{t("packagesPage.title")}</h1>
          <p className="text-[#9aa4ab] max-w-lg font-light leading-relaxed">
            {t("packagesPage.intro")}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <p className="text-[11px] tracking-[0.14em] uppercase text-ink-faint mb-2">{t("experienceSearch.category")}</p>
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} className={`${pill(category === c)} whitespace-nowrap shrink-0`}>{c}</button>
          ))}
        </div>
      </div>

      {/* Sort + count */}
      <div className="flex items-center justify-between mb-5 gap-3">
        <p className="text-sm text-ink-muted font-light whitespace-nowrap shrink-0">{filtered.length} {t("packagesPage.journeys")}</p>
        <div className="flex gap-2 overflow-x-auto scrollbar-none min-w-0">
          {(["Price: Low", "Price: High"] as const).map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-normal tracking-wide transition-colors whitespace-nowrap shrink-0 ${sortBy === s ? "bg-ink text-page" : "bg-panel-soft text-ink-muted hover:text-ink"}`}
            >
              {s === "Price: Low" ? t("listing.priceLow") : t("listing.priceHigh")}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length > 0 ? (
          filtered.map(pkg => <PackageCard key={pkg.id} pkg={pkg} />)
        ) : (
          <div className="col-span-3 text-center py-20">
            <p className="font-serif text-2xl font-light text-ink mb-2">{t("packagesPage.noMatch")}</p>
            <button onClick={() => setCategory("All")} className="mt-3 text-xs tracking-[0.12em] uppercase text-gold hover:underline">
              {t("listing.clearFilters")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
