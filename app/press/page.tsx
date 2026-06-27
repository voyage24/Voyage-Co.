"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";

export default function PressPage() {
  const { t } = useLanguage();

  const MENTIONS = [
    { outlet: "Condé Nast Traveller", quote: t("press.quote1"), date: "2026" },
    { outlet: "Travel + Leisure", quote: t("press.quote2"), date: "2025" },
    { outlet: "Robb Report", quote: t("press.quote3"), date: "2025" },
    { outlet: "AFAR", quote: t("press.quote4"), date: "2025" },
    { outlet: "Forbes Travel Guide", quote: t("press.quote5"), date: "2024" },
  ];

  const FACTS = [
    { label: t("press.factLabel1"), value: "2019" },
    { label: t("press.factLabel2"), value: "Pune, India" },
    { label: t("press.factLabel3"), value: t("press.factValue3") },
    { label: t("press.factLabel4"), value: t("press.factValue4") },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
      <div className="text-center mb-16">
        <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-3">{t("press.eyebrow")}</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-4">{t("press.title")}</h1>
        <p className="text-ink-muted font-light max-w-xl mx-auto leading-relaxed">
          {t("press.intro")}
        </p>
      </div>

      {/* As featured in */}
      <div className="mb-16">
        <h2 className="font-serif text-2xl font-light text-ink mb-6 text-center">{t("press.asFeaturedIn")}</h2>
        <div className="space-y-4">
          {MENTIONS.map(m => (
            <div key={m.outlet} className="bg-panel border border-line rounded-xl p-6">
              <p className="text-base text-ink-muted font-light italic leading-relaxed mb-3">&ldquo;{m.quote}&rdquo;</p>
              <div className="flex items-center gap-2 text-xs text-ink-faint font-light">
                <span className="text-gold font-medium tracking-[0.08em] uppercase">{m.outlet}</span>
                <span>·</span>
                <span>{m.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick facts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-16">
        {FACTS.map(f => (
          <div key={f.label} className="text-center bg-panel-soft border border-line rounded-xl p-5">
            <p className="font-serif text-xl font-light text-ink mb-1">{f.value}</p>
            <p className="text-[10px] tracking-[0.14em] uppercase text-ink-faint font-light">{f.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-panel-soft border border-line rounded-2xl p-10 text-center">
        <h2 className="font-serif text-2xl font-light text-ink mb-2">{t("press.mediaEnquiries")}</h2>
        <p className="text-sm text-ink-muted mb-5 font-light">
          {t("press.mediaEnquiriesDesc")}
        </p>
        <a href="mailto:hello@voyagesco.com" className="inline-block text-base font-medium text-gold link-underline">
          hello@voyagesco.com
        </a>
      </div>
    </div>
  );
}
