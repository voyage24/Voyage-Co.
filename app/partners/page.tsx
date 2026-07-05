"use client";

import { ArrowRight, CheckCircle } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useContent, useContentList } from "@/components/providers/ContentProvider";
import PartnerLogos from "@/components/collections/PartnerLogos";

export default function PartnersPage() {
  const { t } = useLanguage();
  const c = useContent();
  const typesOverride = useContentList("list.partnersTypes");

  const PARTNER_TYPES = [
    {
      title: t("partners.type1Title"),
      desc: t("partners.type1Desc"),
      benefits: [t("partners.type1Benefit1"), t("partners.type1Benefit2"), t("partners.type1Benefit3"), t("partners.type1Benefit4")],
      cta: t("partners.type1Cta"),
    },
    {
      title: t("partners.type2Title"),
      desc: t("partners.type2Desc"),
      benefits: [t("partners.type2Benefit1"), t("partners.type2Benefit2"), t("partners.type2Benefit3"), t("partners.type2Benefit4")],
      cta: t("partners.type2Cta"),
    },
    {
      title: t("partners.type3Title"),
      desc: t("partners.type3Desc"),
      benefits: [t("partners.type3Benefit1"), t("partners.type3Benefit2"), t("partners.type3Benefit3"), t("partners.type3Benefit4")],
      cta: t("partners.type3Cta"),
    },
  ];

  const types = typesOverride
    ? typesOverride.map(p => ({
        title: p.title || "",
        desc: p.desc || "",
        cta: p.cta || "",
        benefits: (p.benefits || "").split("\n").map(s => s.trim()).filter(Boolean),
      }))
    : PARTNER_TYPES;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
      <div className="text-center mb-14">
        <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-4">{c("partners.eyebrow") || t("partners.eyebrow")}</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-4">{c("partners.title") || t("partners.title")}</h1>
        <p className="text-lg text-ink-muted max-w-xl mx-auto font-light leading-relaxed">
          {c("partners.intro") || t("partners.intro")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
        {types.map((p, i) => (
          <div key={`${p.title}-${i}`} className="bg-panel rounded-2xl border border-line shadow-card p-6 flex flex-col">
            <h2 className="font-serif text-xl font-light text-ink mb-2">{p.title}</h2>
            <p className="text-sm text-ink-muted mb-4 flex-1 font-light">{p.desc}</p>
            <ul className="space-y-2 mb-5">
              {p.benefits.map(b => (
                <li key={b} className="flex items-center gap-2 text-sm text-ink-muted font-light">
                  <CheckCircle size={14} className="text-gold shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
            <a
              href={`mailto:hello@voyagesco.com?subject=${encodeURIComponent(`Partnership enquiry: ${p.title}`)}`}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-line-strong text-ink text-xs font-normal tracking-[0.12em] uppercase rounded-sm hover:bg-ink hover:text-page transition-all"
            >
              {p.cta} <ArrowRight size={14} />
            </a>
          </div>
        ))}
      </div>

      <PartnerLogos />

      <div className="bg-vc-800 rounded-2xl p-10 text-center border border-vc-700">
        <h2 className="font-serif text-3xl font-light text-[#ece7dd] mb-2">{t("partners.ctaTitle")}</h2>
        <p className="text-[#9aa4ab] mb-7 font-light">{t("partners.ctaSubtitle")}</p>
        <a href="mailto:hello@voyagesco.com" className="inline-block px-7 py-3.5 bg-[#ece7dd] hover:bg-white text-vc-900 font-normal text-xs tracking-[0.14em] uppercase rounded-sm transition-colors">
          {t("partners.ctaButton")}
        </a>
      </div>
    </div>
  );
}
