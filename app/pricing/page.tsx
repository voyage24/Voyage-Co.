"use client";

import Link from "next/link";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useContent } from "@/components/providers/ContentProvider";

export default function PricingPage() {
  const { t } = useLanguage();
  const c = useContent();
  const sections = [
    { titleKey: "pricing.section1.title", bodyKey: "pricing.section1.body" },
    { titleKey: "pricing.section2.title", bodyKey: "pricing.section2.body" },
    { titleKey: "pricing.section3.title", bodyKey: "pricing.section3.body" },
    { titleKey: "pricing.section4.title", bodyKey: "pricing.section4.body" },
    { titleKey: "pricing.section5.title", bodyKey: "pricing.section5.body" },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
      <div className="mb-10">
        <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-3">{c("pricing.eyebrow") || t("pricing.eyebrow")}</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-3">{c("pricing.title") || t("pricing.title")}</h1>
      </div>

      <p className="text-ink-muted mb-8 leading-relaxed font-light">
        {c("pricing.intro") || t("pricing.intro")}
      </p>

      <div className="space-y-5">
        {sections.map((s, i) => (
          <div key={s.titleKey} className="bg-panel rounded-2xl border border-line shadow-card p-6">
            <h2 className="font-serif text-lg font-light text-ink mb-3 flex items-center gap-3">
              <span className="w-7 h-7 rounded-full border border-gold/40 text-gold text-xs flex items-center justify-center font-medium shrink-0">{i + 1}</span>
              {t(s.titleKey)}
            </h2>
            <p className="text-sm text-ink-muted leading-relaxed font-light">{t(s.bodyKey)}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center bg-vc-800 rounded-2xl p-10 border border-vc-700">
        <h2 className="font-serif text-2xl font-light text-[#ece7dd] mb-3">Ready to see real journeys?</h2>
        <p className="text-[#9aa4ab] mb-6 font-light">Browse our bespoke packages for illustrative pricing on real itineraries.</p>
        <Link href="/packages" className="inline-block px-7 py-3.5 bg-[#ece7dd] hover:bg-white text-vc-900 font-normal text-xs tracking-[0.14em] uppercase rounded-sm transition-colors">
          Browse Packages
        </Link>
      </div>
    </div>
  );
}
