import type { Metadata } from "next";
import ChecklistGenerator from "@/components/tools/ChecklistGenerator";

export const metadata: Metadata = {
  title: "Travel Checklist Generator — Voyages & Co.",
  description: "A countdown checklist of everything to do before you travel — from visas to switching off the lights.",
};

export default function ChecklistToolPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <div className="text-center mb-10">
        <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-3">Trip Tools</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-4">Travel checklist</h1>
        <p className="text-ink-muted font-light max-w-lg mx-auto">A countdown of everything to sort before you go — timed from eight weeks out to departure day.</p>
      </div>
      <ChecklistGenerator />
    </div>
  );
}
