"use client";

import Link from "next/link";
import { Route, Check } from "lucide-react";
import { useItineraryDraft, toggleItinerary, type ItineraryEntry } from "@/lib/itinerary-draft";

// Adds/removes an item from the in-progress itinerary draft (localStorage).
export default function AddToItineraryButton({ label, ...item }: ItineraryEntry & { label?: boolean }) {
  const list = useItineraryDraft();
  const active = list.some(x => x.type === item.type && x.id === item.id);

  return (
    <span className="inline-flex items-center gap-2">
      <button type="button" onClick={() => toggleItinerary(item)} aria-pressed={active}
        className={`inline-flex items-center gap-1.5 text-xs tracking-[0.1em] uppercase transition-colors ${active ? "text-gold" : "text-ink-muted hover:text-ink"}`}>
        {active ? <Check size={15} /> : <Route size={15} />}
        {label && (active ? "In itinerary" : "Add to itinerary")}
      </button>
      {active && <Link href="/itinerary" className="text-[11px] tracking-[0.1em] uppercase text-gold link-underline">View</Link>}
    </span>
  );
}
