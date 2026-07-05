import Link from "next/link";
import type { Metadata } from "next";
import { Check } from "lucide-react";
import MembershipStatus from "@/components/account/MembershipStatus";
import Reveal from "@/components/ui/Reveal";
import { getPageContent } from "@/lib/page-content";
import { getPageList, splitLines } from "@/lib/page-lists";

export const metadata: Metadata = {
  title: "Membership — Voyages & Co.",
  description: "Earn points on every journey and unlock member rates, perks and priority concierge.",
};

const VIP_PERKS = [
  "A dedicated personal travel designer",
  "Priority concierge, around the clock",
  "Complimentary upgrades & welcome amenities",
  "Invitations to private events & experiences",
  "Preferred rates at signature properties",
  "First access to new journeys",
];

const VIP_ENQUIRY = "/contact?message=" + encodeURIComponent("I'd like to request an invitation to Voyages Reserve.");

export default async function MembershipPage() {
  const c = await getPageContent();
  const tiers = (await getPageList("list.membership")).map(t => ({ name: t.name || "", at: t.at || "", perks: splitLines(t.perks) }));
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <div className="text-center mb-10">
        <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-3">{c("membership.eyebrow")}</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-4">{c("membership.title")}</h1>
        <p className="text-ink-muted font-light max-w-xl mx-auto">{c("membership.intro")}</p>
      </div>

      <div className="mb-12"><MembershipStatus /></div>

      <div className="text-center mb-6">
        <p className="text-[11px] tracking-[0.28em] uppercase text-ink-faint">Free loyalty program</p>
      </div>
      <Reveal soft className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {tiers.map((t, i) => (
          <div key={`${t.name}-${i}`} className={`rounded-2xl border p-6 ${i === tiers.length - 1 ? "border-gold/50 bg-panel" : "border-line bg-panel"}`}>
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

      <div className="text-center mt-10 flex flex-wrap gap-3 justify-center">
        <Link href="/signup" className="inline-block px-7 py-3 bg-ink text-page text-xs tracking-[0.16em] uppercase rounded-sm hover:bg-ink/90 transition-colors">Join our free loyalty program</Link>
        <Link href="/account" className="inline-block px-7 py-3 border border-line-strong text-ink text-xs tracking-[0.16em] uppercase rounded-sm hover:bg-ink hover:text-page transition-all">View my account</Link>
      </div>

      {/* Voyages Reserve — a distinct, premium, invitation-based tier. */}
      <section id="voyages-reserve" className="scroll-mt-28 mt-20 rounded-2xl border border-gold/25 bg-gradient-to-b from-[#141d27] to-[#0b131c] p-8 sm:p-14 text-center shadow-[0_0_70px_-20px_rgba(212,175,95,0.4)]">
        <p className="text-[11px] tracking-[0.42em] uppercase text-gold/90 mb-4">By Invitation</p>
        <h2 className="reserve-shimmer font-serif text-4xl sm:text-6xl font-light leading-[1.2] pb-2 tracking-[0.01em]">Voyages Reserve</h2>
        <div className="flex items-center justify-center gap-3 mt-3 mb-7">
          <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold/50" />
          <span className="text-gold text-[9px] leading-none">◆</span>
          <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold/50" />
        </div>
        <p className="text-[#9aa4ab] font-light max-w-xl mx-auto mb-9 leading-relaxed">Our most personal tier of service — a dedicated travel designer, priority everything, and privileges reserved for a select few. Separate from the free loyalty program above.</p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5 max-w-xl mx-auto text-left mb-10">
          {VIP_PERKS.map(p => (
            <li key={p} className="flex items-start gap-2.5 text-sm text-[#d3d8dd] font-light"><Check size={15} className="text-gold shrink-0 mt-0.5" /> {p}</li>
          ))}
        </ul>
        <Link href={VIP_ENQUIRY} className="inline-block px-9 py-3.5 bg-[#ece7dd] text-vc-900 text-xs tracking-[0.18em] uppercase rounded-sm hover:bg-white transition-colors">Request an invitation</Link>
      </section>
    </div>
  );
}
