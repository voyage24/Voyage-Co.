"use client";

import Link from "next/link";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useContent, useContentList } from "@/components/providers/ContentProvider";
import { resolveIcon } from "@/lib/icon-map";
import TeamSection from "@/components/collections/TeamSection";

export default function AboutPage() {
  const { t } = useLanguage();
  const c = useContent();
  const VALUES = [
    { icon: "Target", title: t("about.value1Title"), desc: t("about.value1Desc") },
    { icon: "Globe", title: t("about.value2Title"), desc: t("about.value2Desc") },
    { icon: "Award", title: t("about.value3Title"), desc: t("about.value3Desc") },
  ];
  const values = useContentList("list.aboutValues") ?? VALUES;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-4">{c("about.eyebrow") || t("about.eyebrow")}</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-5">{c("about.title") || t("about.title")}</h1>
        <p className="text-lg text-ink-muted max-w-2xl mx-auto leading-relaxed font-light">
          {c("about.intro") || t("about.intro")}
        </p>
      </div>

      {/* Story */}
      <div className="bg-panel-soft rounded-2xl p-10 mb-12 border border-line">
        <h2 className="font-serif text-3xl font-light text-ink mb-5">{t("about.storyTitle")}</h2>
        <div className="space-y-4 text-ink-muted leading-relaxed font-light">
          <p>{t("about.storyP1")}</p>
          <p>{t("about.storyP2")}</p>
        </div>
      </div>

      {/* Values */}
      <div className="mb-12">
        <h2 className="font-serif text-3xl font-light text-ink mb-6">{t("about.valuesTitle")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {values.map((v, i) => {
            const Icon = resolveIcon(v.icon);
            return (
              <div key={`${v.title}-${i}`} className="bg-panel rounded-2xl border border-line shadow-card p-6">
                <div className="w-11 h-11 rounded-sm border border-gold/30 bg-gold/5 flex items-center justify-center mb-4">
                  <Icon size={19} className="text-gold" />
                </div>
                <h3 className="font-serif text-lg font-light text-ink mb-2">{v.title}</h3>
                <p className="text-sm text-ink-muted font-light">{v.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      <TeamSection />

      {/* CTA */}
      <div className="text-center bg-vc-800 rounded-2xl p-12 border border-vc-700">
        <h2 className="font-serif text-3xl font-light text-[#ece7dd] mb-3">{t("about.ctaTitle")}</h2>
        <p className="text-[#9aa4ab] mb-7 font-light">{t("about.ctaSubtitle")}</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/contact" className="px-7 py-3.5 bg-[#ece7dd] hover:bg-white text-vc-900 font-normal text-xs tracking-[0.14em] uppercase rounded-sm transition-colors">
            {t("about.ctaContact")}
          </Link>
          <Link href="/careers" className="px-7 py-3.5 border border-[#ece7dd]/30 text-[#ece7dd] font-normal text-xs tracking-[0.14em] uppercase rounded-sm hover:bg-[#ece7dd] hover:text-vc-900 transition-all">
            {t("common.careers")}
          </Link>
        </div>
      </div>
    </div>
  );
}
