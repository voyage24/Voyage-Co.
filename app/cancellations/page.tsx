"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";

export default function CancellationsPage() {
  const { t } = useLanguage();
  const sections = [
    {
      titleKey: "cancellations.flight.title",
      content: [
        { headingKey: "cancellations.flight.flexibleFares.heading", textKey: "cancellations.flight.flexibleFares.text" },
        { headingKey: "cancellations.flight.restrictedFares.heading", textKey: "cancellations.flight.restrictedFares.text" },
        { headingKey: "cancellations.flight.carrierChanges.heading", textKey: "cancellations.flight.carrierChanges.text" },
      ],
    },
    {
      titleKey: "cancellations.stay.title",
      content: [
        { headingKey: "cancellations.stay.flexibleRate.heading", textKey: "cancellations.stay.flexibleRate.text" },
        { headingKey: "cancellations.stay.nonRefundable.heading", textKey: "cancellations.stay.nonRefundable.text" },
        { headingKey: "cancellations.stay.noShow.heading", textKey: "cancellations.stay.noShow.text" },
      ],
    },
    {
      titleKey: "cancellations.journey.title",
      content: [
        { headingKey: "cancellations.journey.tier1.heading", textKey: "cancellations.journey.tier1.text" },
        { headingKey: "cancellations.journey.tier2.heading", textKey: "cancellations.journey.tier2.text" },
        { headingKey: "cancellations.journey.tier3.heading", textKey: "cancellations.journey.tier3.text" },
        { headingKey: "cancellations.journey.tier4.heading", textKey: "cancellations.journey.tier4.text" },
      ],
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
      <div className="mb-10">
        <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-3">{t("legal.eyebrow")}</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-3">{t("cancellations.title")}</h1>
        <p className="text-ink-faint font-light">{t("legal.lastUpdated")}: June 2026</p>
      </div>

      <div className="bg-gold/5 border border-gold/30 rounded-2xl p-5 mb-8 text-sm text-ink-muted font-light">
        <strong className="text-gold font-medium">{t("cancellations.noteLabel")}</strong> {t("cancellations.noteText")}
      </div>

      <div className="space-y-8">
        {sections.map(s => (
          <div key={s.titleKey}>
            <h2 className="font-serif text-2xl font-light text-ink mb-4">{t(s.titleKey)}</h2>
            <div className="space-y-4">
              {s.content.map(c => (
                <div key={c.headingKey} className="bg-panel rounded-2xl border border-line shadow-card p-5">
                  <h3 className="font-medium text-ink mb-1.5">{t(c.headingKey)}</h3>
                  <p className="text-sm text-ink-muted leading-relaxed font-light">{t(c.textKey)}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-panel-soft rounded-2xl p-6 text-sm text-ink-muted border border-line font-light">
        <p className="font-medium text-ink mb-2">{t("cancellations.needHelp")}</p>
        <p>{t("cancellations.callConcierge")} <a href="tel:+919919910213" className="text-gold link-underline">+91 99199 10213</a> {t("cancellations.orEmail")} <a href="mailto:hello@voyagesco.com" className="text-gold link-underline">hello@voyagesco.com</a></p>
      </div>
    </div>
  );
}
