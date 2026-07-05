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

const VIP_ENQUIRY = "/contact?message=" + encodeURIComponent("I'd like to request an invitation to the VIP Travel Club.");

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

      {/* VIP Travel Club — a distinct, premium, invitation-based tier. */}
      <section className="mt-20 rounded-2xl bg-vc-950 border border-vc-700 p-8 sm:p-12 text-center">
        <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-3">By Invitation</p>
        <h2 className="font-serif text-3xl font-light text-[#ece7dd] mb-4">VIP Travel Club</h2>
        <p className="text-[#9aa4ab] font-light max-w-xl mx-auto mb-8">Our most personal tier of service — a dedicated travel designer, priority everything, and privileges reserved for a select few. Separate from the free loyalty program above.</p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto text-left mb-9">
          {VIP_PERKS.map(p => (
            <li key={p} className="flex items-start gap-2 text-sm text-[#c9cfd4] font-light"><Check size={15} className="text-gold shrink-0 mt-0.5" /> {p}</li>
          ))}
        </ul>
        <Link href={VIP_ENQUIRY} className="inline-block px-8 py-3.5 bg-[#ece7dd] text-vc-900 text-xs tracking-[0.16em] uppercase rounded-sm hover:bg-white transition-colors">Request an invitation</Link>
      </section>
    </div>
  );
}
