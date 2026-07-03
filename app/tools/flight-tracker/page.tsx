import type { Metadata } from "next";
import FlightTracker from "@/components/tools/FlightTracker";

export const metadata: Metadata = {
  title: "Flight Tracker — Voyages & Co.",
  description: "Track any flight's route, times, terminals and aircraft by flight number and date.",
};

export default function FlightTrackerPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <div className="text-center mb-10">
        <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-3">Trip Tools</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-4">Flight tracker</h1>
        <p className="text-ink-muted font-light max-w-lg mx-auto">Enter a flight number and date to see its route, scheduled times, terminals and aircraft.</p>
      </div>
      <FlightTracker />
      <p className="text-[11px] text-ink-faint font-light text-center mt-6 max-w-xl mx-auto">
        Schedule &amp; status data is provided by our flight partner and may be limited for some carriers or dates.
      </p>
    </div>
  );
}
