import type { Metadata } from "next";
import LiveFlightMap from "@/components/tools/LiveFlightMap";

export const metadata: Metadata = {
  title: "Live Flight Tracker — Voyages & Co.",
  description: "Track any flight live on the world map — real-time position, altitude, speed and heading by flight number.",
};

export default function FlightTrackerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <div className="text-center mb-10">
        <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-3">Trip Tools</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-4">Live flight tracker</h1>
        <p className="text-ink-muted font-light max-w-lg mx-auto">Enter a flight number to follow the aircraft live on the map — its position, altitude, speed and heading, refreshed every few seconds.</p>
      </div>
      <LiveFlightMap />
      <p className="text-[11px] text-ink-faint font-light text-center mt-6 max-w-xl mx-auto">
        Live positions are sourced from open ADS-B data and are available while an aircraft is airborne and broadcasting. Coverage varies by region and carrier.
      </p>
    </div>
  );
}
