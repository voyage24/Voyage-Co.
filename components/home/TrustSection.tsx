"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";

const PILLARS = [
  { numeral: "I", key: "pillar1" },
  { numeral: "II", key: "pillar2" },
  { numeral: "III", key: "pillar3" },
  { numeral: "IV", key: "pillar4" },
];

export default function TrustSection() {
  const { t } = useLanguage();
  return (
    <section className="bg-panel-soft py-24 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[10px] font-medium tracking-[0.3em] uppercase text-gold mb-3">
            {t("trust.promiseEyebrow")}
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl font-light text-ink">
            {t("trust.commitment")}
          </h2>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {PILLARS.map(p => (
            <div key={p.numeral} className="group">
              <div className="flex items-center gap-4 mb-5">
                <span className="font-serif text-4xl font-light text-gold/40 group-hover:text-gold transition-colors duration-500 leading-none">
                  {p.numeral}
                </span>
                <div className="h-px flex-1 bg-line group-hover:bg-gold/40 transition-colors duration-500" />
              </div>
              <h3 className="font-serif text-xl font-light text-ink mb-4 leading-snug">
                {t(`trust.${p.key}.title`)}
              </h3>
              <p className="text-sm text-ink-muted font-light leading-relaxed">
                {t(`trust.${p.key}.desc`)}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16 pt-16 border-t border-line">
          <p className="font-serif text-2xl font-light text-ink mb-6">
            {t("trust.ctaPre")} <em className="not-italic text-gold">{t("trust.ctaEm")}</em> {t("trust.ctaSuffix")}
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-3 px-8 py-4 border border-line-strong text-ink text-xs font-normal tracking-[0.18em] uppercase hover:bg-ink hover:text-page transition-all duration-300 rounded-sm hover:scale-105 active:scale-95"
          >
            {t("trust.ctaButton")}
          </a>
        </div>
      </div>
    </section>
  );
}
