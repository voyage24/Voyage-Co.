"use client";

import PlanWizard from "@/components/plan/PlanWizard";
import TripPlanner from "@/components/trip-planner/TripPlanner";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useContent } from "@/components/providers/ContentProvider";

export default function PlanPage() {
  const { t } = useLanguage();
  const c = useContent();
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
      <div className="text-center mb-8">
        <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-3">{c("plan.eyebrow") || t("plan.eyebrow")}</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-3">{c("plan.title") || t("plan.title")}</h1>
        <p className="text-ink-muted font-light max-w-xl mx-auto">
          Describe your trip in a sentence — we&apos;ll design the whole journey: flights, stays, experiences,
          restaurants, museums, day trips, weather, getting around and an estimated cost.
        </p>
      </div>

      {/* Primary: the Smart Trip Planner. */}
      <TripPlanner />

      {/* Alternative: the guided concierge brief for those who prefer a form. */}
      <div className="mt-16 pt-10 border-t border-line text-center mb-8">
        <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-2">Prefer a guided brief?</p>
        <h2 className="font-serif text-2xl sm:text-3xl font-light text-ink">Tell us your preferences</h2>
        <p className="text-ink-muted font-light mt-2 max-w-xl mx-auto">
          Answer a few questions and a concierge will craft a tailored proposal for you.
        </p>
      </div>
      <PlanWizard />
    </div>
  );
}
