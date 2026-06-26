"use client";

import Link from "next/link";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function TermsPage() {
  const { t } = useLanguage();
  const sections = [
    { titleKey: "terms.section1.title", bodyKey: "terms.section1.body" },
    { titleKey: "terms.section2.title", bodyKey: "terms.section2.body" },
    { titleKey: "terms.section3.title", bodyKey: "terms.section3.body" },
    {
      titleKey: "terms.section4.title",
      bodyPreKey: "terms.section4.bodyPre",
      linkHref: "/cancellations",
      bodyPostKey: "terms.section4.bodyPost",
    },
    { titleKey: "terms.section5.title", bodyKey: "terms.section5.body" },
    { titleKey: "terms.section6.title", bodyKey: "terms.section6.body" },
    { titleKey: "terms.section7.title", bodyKey: "terms.section7.body" },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
      <div className="mb-10">
        <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-3">{t("legal.eyebrow")}</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-3">{t("terms.title")}</h1>
        <p className="text-ink-faint font-light">{t("legal.lastUpdated")}: June 1, 2026</p>
      </div>

      <p className="text-ink-muted mb-8 leading-relaxed font-light">
        {t("terms.intro")}
      </p>

      <div className="space-y-5">
        {sections.map((s, i) => (
          <div key={s.titleKey} className="bg-panel rounded-2xl border border-line shadow-card p-6">
            <h2 className="font-serif text-lg font-light text-ink mb-3 flex items-center gap-3">
              <span className="w-7 h-7 rounded-full border border-gold/40 text-gold text-xs flex items-center justify-center font-medium shrink-0">{i + 1}</span>
              {t(s.titleKey)}
            </h2>
            <p className="text-sm text-ink-muted leading-relaxed font-light">
              {s.linkHref ? (
                <>{t(s.bodyPreKey as string)}<Link href={s.linkHref as string} className="inline-block text-gold link-underline transition-transform duration-200 hover:scale-105 active:scale-95">{t("common.cancellations")}</Link>{t(s.bodyPostKey as string)}</>
              ) : (
                t(s.bodyKey as string)
              )}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 text-sm text-ink-muted font-light">
        <p>{t("terms.contactLine")} <a href="mailto:hello@voyagesco.com" className="text-gold link-underline">hello@voyagesco.com</a></p>
      </div>
    </div>
  );
}
