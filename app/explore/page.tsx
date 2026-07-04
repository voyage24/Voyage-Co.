"use client";

import ExploreMap from "@/components/explore/ExploreMap";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useContent } from "@/components/providers/ContentProvider";

export default function ExplorePage() {
  const { t } = useLanguage();
  const c = useContent();
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
      <div className="text-center mb-10">
        <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-3">{c("explore.eyebrow") || t("explore.eyebrow")}</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-3">{c("explore.title") || t("explore.title")}</h1>
        <p className="text-ink-muted font-light max-w-xl mx-auto">{c("explore.subtitle") || t("explore.subtitle")}</p>
      </div>
      <ExploreMap />
    </div>
  );
}
