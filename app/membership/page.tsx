import Link from "next/link";
import type { Metadata } from "next";
import { Check } from "lucide-react";
import MembershipStatus from "@/components/account/MembershipStatus";
import Reveal from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Membership — Voyages & Co.",
  description: "Earn points on every journey and unlock member rates, perks and priority concierge.",
};

const TIERS = [
  { name: "Member", at: "0 points", perks: ["Save journeys & build itineraries", "Member-only offers", "Tailored ideas from our concierge"] },
  { name: "Silver", at: "1,500 points", perks: ["Everything in Member", "Priority concierge", "Welcome amenity on stays"] },
  { name: "Gold", at: "5,000 points", perks: ["Everything in Silver", "Complimentary upgrades when available", "A dedicated travel advisor"] },
];

export default function MembershipPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <div className="text-center mb-10">
        <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-3">Membership</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-4">Travel, rewarded.</h1>
        <p className="text-ink-muted font-light max-w-xl mx-auto">Earn one point for every ₹1,000 spent on confirmed journeys. As your points grow, so do your privileges.</p>
      </div>

      <div className="mb-12"><MembershipStatus /></div>

      <Reveal soft className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {TIERS.map((t, i) => (
          <div key={t.name} className={`rounded-2xl border p-6 ${i === 2 ? "border-gold/50 bg-panel" : "border-line bg-panel"}`}>
            <h2 className="font-serif text-2xl font-light text-ink">{t.name}</h2>
            <p className="text-xs tracking-[0.12em] uppercase text-gold mb-4">{t.at}</p>
            <ul className="space-y-2">
              {t.perks.map(p => (
                <li key={p} className="flex items-start gap-2 text-sm text-ink-muted font-light"><Check size={15} className="text-gold shrink-0 mt-0.5" /> {p}</li>
              ))}
            </ul>
          </div>
        ))}
      </Reveal>

      <div className="text-center mt-10">
        <Link href="/account" className="inline-block px-7 py-3 bg-ink text-page text-xs tracking-[0.16em] uppercase rounded-sm hover:bg-ink/90 transition-colors">View my account</Link>
      </div>
    </div>
  );
}
