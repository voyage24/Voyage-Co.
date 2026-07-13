"use client";

import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import TripPlanner from "@/components/trip-planner/TripPlanner";
import { useContent } from "@/components/providers/ContentProvider";

export default function PlanPage() {
  const c = useContent();
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
      <div className="text-center mb-8">
        <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-3">{c("plan.eyebrow") || "Plan your journey"}</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-3">{c("plan.title") || "Smart Trip Planner"}</h1>
        <p className="text-ink-muted font-light max-w-xl mx-auto">
          Describe your trip in a sentence — we&apos;ll design the whole journey: flights, stays, experiences,
          restaurants, museums, day trips, weather, getting around and an estimated cost.
        </p>
      </div>

      <TripPlanner />

      {/* Travelling with others — a clear, always-visible way into group trips. */}
      <Link href="/groups" className="group flex items-center gap-4 rounded-2xl border border-gold/30 bg-panel-soft p-5 mt-10 hover:border-gold/60 transition-colors">
        <span className="shrink-0 w-11 h-11 rounded-full bg-gold/15 text-gold flex items-center justify-center"><Users size={20} /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-ink">Travelling with others? Plan as a group</span>
          <span className="block text-xs text-ink-muted font-light mt-0.5">Invite friends or family to vote on stays, split expenses, chat and share photos.</span>
        </span>
        <ArrowRight size={18} className="text-gold shrink-0 group-hover:translate-x-0.5 transition-transform" />
      </Link>

      {/* Quiet fallback for those who'd rather answer questions than describe a trip. */}
      <div className="mt-8 text-center">
        <Link href="/plan/guided" className="inline-flex items-center gap-1.5 text-xs tracking-[0.14em] uppercase text-ink-muted link-underline">
          Not sure where to start? Brief a concierge <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
