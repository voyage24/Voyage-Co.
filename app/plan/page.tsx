"use client";

import PlanWizard from "@/components/plan/PlanWizard";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useContent } from "@/components/providers/ContentProvider";

export default function PlanPage() {
  const { t } = useLanguage();
  const c = useContent();
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
      <div className="text-center mb-10">
        <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-3">{c("plan.eyebrow") || t("plan.eyebrow")}</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-3">{c("plan.title") || t("plan.title")}</h1>
        <p className="text-ink-muted font-light max-w-xl mx-auto">{c("plan.subtitle") || t("plan.subtitle")}</p>
      </div>
      <PlanWizard />
    </div>
  );
}
