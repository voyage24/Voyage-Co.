import Link from "next/link";
import type { Metadata } from "next";
import { Gift } from "lucide-react";
import { getCurrentCustomer } from "@/lib/customer/session";
import { ensureReferralCode, getReferralPoints } from "@/lib/customer/referral";
import { getPageContent } from "@/lib/page-content";
import ReferShare from "@/components/account/ReferShare";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Refer a Friend — Voyages & Co.",
  description: "Introduce a friend to Voyages & Co. and earn loyalty points when they join.",
};

const SITE_URL = "https://voyagesco.com";

export default async function ReferPage() {
  const customer = await getCurrentCustomer();
  const c = await getPageContent();
  const points = await getReferralPoints();
  const code = customer ? await ensureReferralCode(customer) : null;
  const link = code ? `${SITE_URL}/signup?ref=${code}` : "";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <div className="text-center mb-10">
        <Gift size={28} className="text-gold mx-auto mb-4" />
        <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-3">{c("refer.eyebrow")}</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-4">{c("refer.title")}</h1>
        <p className="text-ink-muted font-light max-w-xl mx-auto">
          Introduce a friend to Voyages &amp; Co. When they create an account, you&apos;ll earn <span className="text-ink font-medium">{points} loyalty points</span> — our thanks for spreading the word.
        </p>
      </div>

      {customer ? (
        <div className="bg-panel border border-line rounded-2xl p-6 sm:p-8">
          <p className="text-[11px] tracking-[0.14em] uppercase text-ink-faint mb-3">Your personal link</p>
          <ReferShare link={link} />
          <p className="text-xs text-ink-faint font-light mt-6 leading-relaxed">
            Points are credited once your friend confirms their email address. Track your balance in <Link href="/account" className="text-gold link-underline">My Account</Link>.
          </p>
        </div>
      ) : (
        <div className="text-center bg-panel border border-line rounded-2xl p-8">
          <p className="text-ink-muted font-light mb-6">Sign in or create your free account to get your personal referral link.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/login" className="px-7 py-3 border border-line-strong text-ink text-xs tracking-[0.16em] uppercase rounded-sm hover:bg-ink hover:text-page transition-all">Sign in</Link>
            <Link href="/signup" className="px-7 py-3 bg-ink text-page text-xs tracking-[0.16em] uppercase rounded-sm hover:bg-ink/90 transition-colors">Create account</Link>
          </div>
        </div>
      )}
    </div>
  );
}
