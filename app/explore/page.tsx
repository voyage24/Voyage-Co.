"use client";

import Link from "next/link";
import { Navigation } from "lucide-react";
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
        <Link href="/near-me" className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 border border-line-strong text-ink text-xs tracking-[0.14em] uppercase rounded-sm hover:bg-ink hover:text-page transition-colors">
          <Navigation size={14} /> What&apos;s near me
        </Link>
      </div>
      <ExploreMap />
    </div>
  );
}
