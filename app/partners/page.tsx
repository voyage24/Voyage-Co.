"use client";

import { ArrowRight, CheckCircle } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

const PARTNER_TYPES = [
  {
    title: "Hotels & Resorts",
    desc: "Present your property to a discerning clientele who value the exceptional and book without hesitation.",
    benefits: ["Curated placement", "Dedicated relationship manager", "Qualified, high-value guests", "Preferred-partner programme"],
    cta: "Partner with us",
  },
  {
    title: "Villas & Private Estates",
    desc: "Introduce your residence to members seeking privacy, space and impeccable service.",
    benefits: ["Discreet listing", "Vetted guests only", "Concierge coordination", "Tailored commercial terms"],
    cta: "Become a partner",
  },
  {
    title: "Experience Curators",
    desc: "Share your rare, once-in-a-lifetime experiences with travellers who seek precisely that.",
    benefits: ["Storytelling support", "Seamless coordination", "Premium positioning", "Long-term collaboration"],
    cta: "Collaborate",
  },
];

export default function PartnersPage() {
  const { t } = useLanguage();
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
      <div className="text-center mb-14">
        <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-4">{t("partners.eyebrow")}</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-4">{t("partners.title")}</h1>
        <p className="text-lg text-ink-muted max-w-xl mx-auto font-light leading-relaxed">
          {t("partners.intro")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
        {PARTNER_TYPES.map(p => (
          <div key={p.title} className="bg-panel rounded-2xl border border-line shadow-card p-6 flex flex-col">
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
