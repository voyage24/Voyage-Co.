"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PlanWizard from "@/components/plan/PlanWizard";

// The guided concierge brief — a quieter alternative to the Smart Trip Planner
// on /plan, for travellers who'd rather answer a few questions (or who don't yet
// know where they want to go).
export default function GuidedPlanPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
      <div className="text-center mb-8">
        <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-3">Guided brief</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-3">Tell us your preferences</h1>
        <p className="text-ink-muted font-light max-w-xl mx-auto">
          Answer a few questions and a concierge will craft a tailored proposal for you — ideal if you&apos;re
          still deciding where to go.
        </p>
      </div>

      <PlanWizard />

      <div className="mt-10 text-center">
        <Link href="/plan" className="inline-flex items-center gap-1.5 text-xs tracking-[0.14em] uppercase text-ink-muted link-underline">
          <ArrowLeft size={13} /> Back to the Smart Trip Planner
        </Link>
      </div>
    </div>
  );
}
