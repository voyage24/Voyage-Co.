import type { Metadata } from "next";
import PackingListGenerator from "@/components/tools/PackingListGenerator";

export const metadata: Metadata = {
  title: "Smart Packing List — Voyages & Co.",
  description: "Generate a tailored packing list from your trip length, climate and activities.",
};

export default function PackingToolPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <div className="text-center mb-10">
        <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-3">Trip Tools</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-4">Smart packing list</h1>
        <p className="text-ink-muted font-light max-w-lg mx-auto">Tell us about your trip and we&apos;ll build a tailored, tick-off packing list — nothing forgotten.</p>
      </div>
      <PackingListGenerator />
    </div>
  );
}
