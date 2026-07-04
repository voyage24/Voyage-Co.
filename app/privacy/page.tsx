"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useContent } from "@/components/providers/ContentProvider";

export default function PrivacyPage() {
  const { t } = useLanguage();
  const c = useContent();
  const sections = [
    { titleKey: "privacy.section1.title", bodyKey: "privacy.section1.body" },
    { titleKey: "privacy.section2.title", bodyKey: "privacy.section2.body" },
    { titleKey: "privacy.section3.title", bodyKey: "privacy.section3.body" },
    { titleKey: "privacy.section4.title", bodyKey: "privacy.section4.body" },
    { titleKey: "privacy.section5.title", bodyKey: "privacy.section5.body" },
    { titleKey: "privacy.section6.title", bodyKey: "privacy.section6.body" },
    { titleKey: "privacy.section7.title", bodyKey: "privacy.section7.body" },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
      <div className="mb-10">
        <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-3">{c("privacy.eyebrow") || t("legal.eyebrow")}</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-3">{c("privacy.title") || t("privacy.title")}</h1>
        <p className="text-ink-faint font-light">{t("legal.lastUpdated")}: June 1, 2026</p>
      </div>

      <p className="text-ink-muted mb-8 leading-relaxed font-light">
        {c("privacy.intro") || t("privacy.intro")}
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

      <div className="mt-8 text-sm text-ink-muted font-light">
        <p>{t("privacy.contactLine")} <a href="mailto:hello@voyagesco.com" className="text-gold link-underline">hello@voyagesco.com</a></p>
      </div>
    </div>
  );
}
