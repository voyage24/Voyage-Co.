"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CruiseCard from "@/components/cards/CruiseCard";
import { CRUISES } from "@/lib/mock-data";
import { useLanguage } from "@/components/providers/LanguageProvider";

const REGIONS = ["All", "Caribbean", "Mediterranean", "Alaska", "Norwegian Fjords", "Antarctica", "Galápagos", "Asia & Far East", "Nile & Egypt", "European Rivers", "Transatlantic", "World Cruise", "South Pacific", "Indian Ocean", "Baltic & Scandinavia"];
const CATEGORIES = ["All", "ultra-luxury", "luxury", "expedition", "river", "family"];

function CruisesContent() {
  const { t } = useLanguage();
  const params = useSearchParams();
  const [region, setRegion] = useState(params.get("region") ?? "All");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Price: Low");

  const filtered = CRUISES
    .filter(c => region === "All" || c.region === region)
    .filter(c => category === "All" || c.category === category)
    .sort((a, b) => {
      if (sortBy === "Price: Low") return a.pricePerPerson - b.pricePerPerson;
      if (sortBy === "Price: High") return b.pricePerPerson - a.pricePerPerson;
      if (sortBy === "Rating") return b.rating - a.rating;
      return 0;
    });

  const pill = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-xs font-normal tracking-[0.08em] uppercase border transition-colors ${active ? "bg-ink border-ink text-page" : "border-line text-ink-muted hover:border-ink/40"}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
      {/* Hero banner */}
      <div className="rounded-2xl overflow-hidden p-10 mb-10 bg-vc-800 border border-vc-700">
        <p className="text-[10px] font-normal uppercase tracking-[0.3em] text-[#b09e74] mb-3">{t("cruisesPage.eyebrow")}</p>
        <h1 className="font-serif text-4xl font-light text-[#ece7dd] mb-3">{t("cruisesPage.title")}</h1>
        <p className="text-[#9aa4ab] max-w-lg font-light leading-relaxed">
          {t("cruisesPage.intro")}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <p className="text-[11px] tracking-[0.14em] uppercase text-ink-faint mb-2">{t("cruiseSearch.region")}</p>
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {REGIONS.map(r => (
            <button key={r} onClick={() => setRegion(r)} className={`${pill(region === r)} whitespace-nowrap shrink-0`}>{r}</button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <p className="text-[11px] tracking-[0.14em] uppercase text-ink-faint mb-2">{t("cruisesPage.style")}</p>
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} className={`${pill(category === c)} capitalize whitespace-nowrap shrink-0`}>{c}</button>
          ))}
        </div>
      </div>

      {/* Sort + count */}
      <div className="flex items-center justify-between mb-5 gap-3">
        <p className="text-sm text-ink-muted font-light whitespace-nowrap shrink-0">{filtered.length} {filtered.length !== 1 ? t("cruisesPage.voyages") : t("cruisesPage.voyage")}</p>
        <div className="flex gap-2 overflow-x-auto scrollbar-none min-w-0">
          {(["Price: Low", "Price: High", "Rating"] as const).map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-normal tracking-wide transition-colors whitespace-nowrap shrink-0 ${sortBy === s ? "bg-ink text-page" : "bg-panel-soft text-ink-muted hover:text-ink"}`}
            >
              {s === "Price: Low" ? t("listing.priceLow") : s === "Price: High" ? t("listing.priceHigh") : t("listing.rating")}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length > 0 ? (
          filtered.map((cruise, i) => <CruiseCard key={cruise.id} cruise={cruise} priority={i === 0} />)
        ) : (
          <div className="col-span-3 text-center py-20">
            <p className="font-serif text-2xl font-light text-ink mb-2">{t("cruisesPage.noMatch")}</p>
            <button
              onClick={() => { setRegion("All"); setCategory("All"); }}
              className="mt-3 text-xs tracking-[0.12em] uppercase text-gold hover:underline"
            >
              {t("listing.clearFilters")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CruisesPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-4">
        <div className="h-40 bg-panel-soft rounded-2xl animate-pulse" />
        <div className="h-24 bg-panel-soft rounded-2xl animate-pulse" />
      </div>
    }>
      <CruisesContent />
    </Suspense>
  );
}
