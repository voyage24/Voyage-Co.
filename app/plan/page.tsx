"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
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

      <TripPlanner />

      {/* Quiet fallback for those who'd rather answer questions than describe a trip. */}
      <div className="mt-12 text-center">
        <Link href="/plan/guided" className="inline-flex items-center gap-1.5 text-xs tracking-[0.14em] uppercase text-ink-muted link-underline">
          Not sure where to start? Brief a concierge <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
