"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useContent } from "@/components/providers/ContentProvider";
import { useSetting } from "@/components/providers/SettingsProvider";

export default function DeliveryPolicyPage() {
  const { t } = useLanguage();
  const c = useContent();
  const email = useSetting("contact.email") || "hello@voyagesco.com";
  const sections = [
    { titleKey: "deliveryPolicy.section1.title", bodyKey: "deliveryPolicy.section1.body" },
    { titleKey: "deliveryPolicy.section2.title", bodyKey: "deliveryPolicy.section2.body" },
    { titleKey: "deliveryPolicy.section3.title", bodyKey: "deliveryPolicy.section3.body" },
    { titleKey: "deliveryPolicy.section4.title", bodyKey: "deliveryPolicy.section4.body" },
    { titleKey: "deliveryPolicy.section5.title", bodyKey: "deliveryPolicy.section5.body" },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
      <div className="mb-10">
        <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-3">{c("deliveryPolicy.eyebrow") || t("legal.eyebrow")}</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-3">{c("deliveryPolicy.title") || t("deliveryPolicy.title")}</h1>
        <p className="text-ink-faint font-light">{t("legal.lastUpdated")}: September 2026</p>
      </div>

      <p className="text-ink-muted mb-8 leading-relaxed font-light">
        {c("deliveryPolicy.intro") || t("deliveryPolicy.intro")}
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
        <p>{t("deliveryPolicy.contactLine")} <a href={`mailto:${email}`} className="text-gold link-underline">{email}</a></p>
      </div>
    </div>
  );
}
