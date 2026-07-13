import type { Metadata } from "next";
import TripPlanner from "@/components/trip-planner/TripPlanner";

export const metadata: Metadata = {
  title: "Smart Trip Planner — Voyages & Co.",
  description: "Describe your trip in a sentence and we'll design a complete itinerary — flights, stays, experiences, restaurants, museums, day trips, weather, getting around and an estimated cost.",
};

export default function TripPlannerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
      <div className="text-center mb-8">
        <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-3">Smart trip planner</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-3">Describe your trip. We&apos;ll plan it.</h1>
        <p className="text-ink-muted font-light max-w-xl mx-auto">
          Tell us where and how long — we&apos;ll design the whole journey: flights, stays, experiences,
          restaurants, museums, day trips, weather, how to get around and what it might cost.
        </p>
      </div>
      <TripPlanner />
    </div>
  );
}
