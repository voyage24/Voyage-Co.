import type { Metadata } from "next";
import { Check } from "lucide-react";
import RequestForm from "@/components/tools/RequestForm";
import Reveal from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Travel Insurance — Voyages & Co.",
  description: "Travel with peace of mind — medical, cancellation, baggage and adventure cover tailored to your journey.",
};

const PLANS = [
  { name: "Essential", tag: "Everyday cover", perks: ["Emergency medical & evacuation", "Trip cancellation & curtailment", "Lost or delayed baggage", "24/7 assistance helpline"] },
  { name: "Signature", tag: "Most popular", perks: ["Everything in Essential", "Higher medical & cancellation limits", "Missed connection & travel delay", "Gadget & valuables cover", "Adventure activities"] },
  { name: "Elite", tag: "Comprehensive", perks: ["Everything in Signature", "Top-tier medical worldwide", "Cancel-for-any-reason option", "Business equipment cover", "Concierge medical support"] },
];

export default function InsurancePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <div className="text-center mb-12">
        <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-3">Travel Services</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-4">Travel insurance</h1>
        <p className="text-ink-muted font-light max-w-xl mx-auto">Journey with confidence. We&apos;ll match you to cover that fits your trip — from a weekend away to a months-long expedition.</p>
      </div>

      <Reveal soft className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {PLANS.map((p, i) => (
          <div key={p.name} className={`relative bg-panel border rounded-2xl p-6 ${i === 1 ? "border-gold shadow-card" : "border-line"}`}>
            {i === 1 && <span className="absolute top-4 right-4 text-[9px] tracking-[0.16em] uppercase bg-gold text-page px-2 py-0.5 rounded-sm">Popular</span>}
            <p className="text-[10px] tracking-[0.2em] uppercase text-gold mb-1">{p.tag}</p>
            <h3 className="font-serif text-2xl font-light text-ink mb-4">{p.name}</h3>
            <ul className="space-y-2">
              {p.perks.map(perk => (
                <li key={perk} className="flex items-start gap-2 text-sm text-ink-muted font-light"><Check size={15} className="text-gold shrink-0 mt-0.5" /> {perk}</li>
              ))}
            </ul>
          </div>
        ))}
      </Reveal>

      <p className="text-xs text-ink-faint font-light leading-relaxed mb-10 text-center max-w-2xl mx-auto">
        Plans are illustrative; final terms, limits and premiums are confirmed on your quote. Cover is arranged through regulated insurance partners — pre-existing conditions and exclusions may apply.
      </p>

      <RequestForm
        endpoint="/api/insurance-request"
        title="Request a quote"
        submitLabel="Get my quote"
        successText="We'll match you to the right cover and send a tailored quote shortly."
        fields={[
          { key: "plan", label: "Plan", type: "select", options: ["Essential", "Signature", "Elite", "Not sure — advise me"] },
          { key: "destination", label: "Destination(s)", placeholder: "e.g. Italy & Switzerland" },
          { key: "travellers", label: "Travellers", placeholder: "e.g. 2 adults, 1 child" },
          { key: "tripStart", label: "Trip start", type: "date" },
          { key: "tripEnd", label: "Trip end", type: "date" },
          { key: "details", label: "Anything else", type: "textarea", placeholder: "Ages, activities, pre-existing conditions…" },
        ]}
      />
    </div>
  );
}
