"use client";

import SearchWidget from "@/components/search/SearchWidget";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function ReservationSection() {
  const { t } = useLanguage();
  return (
    <section className="bg-panel-soft py-24 md:py-28 px-6 lg:px-12 border-y border-line">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[11px] tracking-[0.32em] uppercase text-gold mb-5">{t("reservation.begin")}</p>
          <h2 className="font-serif font-light text-ink text-4xl sm:text-5xl">{t("reservation.planJourney")}</h2>
        </div>
        <SearchWidget />
      </div>
    </section>
  );
}
