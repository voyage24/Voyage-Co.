import type { Metadata } from "next";
import CurrencyConverter from "@/components/tools/CurrencyConverter";

export const metadata: Metadata = {
  title: "Currency Converter — Voyages & Co.",
  description: "Convert between 40+ world currencies with live exchange rates for your journey.",
};

export default function CurrencyToolPage() {
  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <div className="text-center mb-10">
        <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-3">Trip Tools</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-4">Currency converter</h1>
        <p className="text-ink-muted font-light">Live rates across 40+ currencies, so you always know what you&apos;re spending.</p>
      </div>
      <CurrencyConverter />
    </div>
  );
}
