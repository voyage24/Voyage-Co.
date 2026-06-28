"use client";

import ExploreMap from "@/components/explore/ExploreMap";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function ExplorePage() {
  const { t } = useLanguage();
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
      <div className="text-center mb-10">
        <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-3">{t("explore.eyebrow")}</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-3">{t("explore.title")}</h1>
        <p className="text-ink-muted font-light max-w-xl mx-auto">{t("explore.subtitle")}</p>
      </div>
      <ExploreMap />
    </div>
  );
}
