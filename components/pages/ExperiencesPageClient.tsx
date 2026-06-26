"use client";

import { useState } from "react";
import ExperienceCard from "@/components/cards/ExperienceCard";
import type { Experience } from "@/lib/types";
import { useLanguage } from "@/components/providers/LanguageProvider";

const CATEGORIES = ["All", "adventure", "wellness", "wildlife", "cultural", "culinary", "spiritual"];

export default function ExperiencesPageClient({ experiences }: { experiences: Experience[] }) {
  const { t } = useLanguage();
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Price: Low");

  const filtered = experiences
    .filter(e => category === "All" || e.category === category)
    .sort((a, b) => {
      if (sortBy === "Price: Low") return a.price - b.price;
      if (sortBy === "Price: High") return b.price - a.price;
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
      <div className="mb-8">
        <p className="text-[10px] tracking-[0.28em] uppercase text-gold mb-2">{t("experiencesPage.eyebrow")}</p>
        <h1 className="font-serif text-3xl sm:text-4xl font-light text-ink">{t("experiencesPage.title")}</h1>
        <p className="text-sm text-ink-muted mt-1 font-light">{t("experiencesPage.subtitle")}</p>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-4 py-2 rounded-full text-xs font-normal tracking-[0.08em] uppercase whitespace-nowrap transition-colors capitalize ${category === c ? "bg-ink text-page" : "bg-panel-soft text-ink-muted hover:text-ink"}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Sort + count */}
      <div className="flex items-center justify-between mb-5 gap-3">
        <p className="text-sm text-ink-muted font-light whitespace-nowrap shrink-0">{filtered.length} {t("experiencesPage.experiences")}</p>
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
        {filtered.map((exp, i) => (
          <ExperienceCard key={exp.id} exp={exp} priority={i === 0} />
        ))}
      </div>
    </div>
  );
}
