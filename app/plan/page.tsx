"use client";

import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
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
      <Link href="/trip-planner" className="group flex items-center gap-4 rounded-2xl border border-gold/30 bg-panel-soft p-5 mb-8 hover:border-gold/60 transition-colors">
        <span className="shrink-0 w-11 h-11 rounded-full bg-gold/15 text-gold flex items-center justify-center"><Sparkles size={20} /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-ink">Try the Smart Trip Planner</span>
          <span className="block text-xs text-ink-muted font-light mt-0.5">Describe your trip in a sentence and we&apos;ll draft the whole itinerary instantly.</span>
        </span>
        <ArrowRight size={18} className="text-gold shrink-0 group-hover:translate-x-0.5 transition-transform" />
      </Link>

      <PlanWizard />
    </div>
  );
}
