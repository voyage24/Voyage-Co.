import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import GiftShare from "@/components/gift/GiftShare";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "A Gift — Voyages & Co.", robots: { index: false } };

export default async function GiftCardPage({ params }: { params: { code: string } }) {
  const card = await prisma.giftCard.findUnique({ where: { code: params.code.toUpperCase() } });
  if (!card || card.status === "void") notFound();

  const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const url = `${SITE_URL}/gift/${card.code}`;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      {/* The card itself */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#2b1d12] via-[#1c0a0d] to-[#0d0608] text-[#f4f0e9] shadow-luxury border border-gold/20">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #f4f0e9 1px, transparent 0)", backgroundSize: "22px 22px" }} />
        <div className="relative p-8 sm:p-12 text-center">
          <p className="text-[11px] tracking-[0.4em] uppercase text-gold mb-1">Voyages &amp; Co.</p>
          <p className="text-[10px] tracking-[0.3em] uppercase text-white/50 mb-8">The gift of travel</p>

          {card.recipientName && (
            <p className="font-serif text-2xl font-light text-white/90 mb-2">Dear {card.recipientName},</p>
          )}
          <p className="text-white/70 font-light mb-6">{card.senderName ? `${card.senderName} has gifted you` : "You have been gifted"}</p>

          <p className="font-serif text-6xl sm:text-7xl font-light text-gold mb-2">{inr(card.amount)}</p>
          <p className="text-[11px] tracking-[0.2em] uppercase text-white/50 mb-8">towards an extraordinary journey</p>

          {card.message && (
            <p className="font-serif text-lg font-light italic text-white/85 max-w-md mx-auto mb-8">&ldquo;{card.message}&rdquo;</p>
          )}

          <div className="inline-block border border-gold/30 rounded-sm px-6 py-3 mb-2">
            <p className="text-[10px] tracking-[0.2em] uppercase text-white/40 mb-1">Gift code</p>
            <p className="font-mono text-xl tracking-[0.2em] text-white">{card.code}</p>
          </div>
          {card.status === "redeemed" ? (
            <p className="text-xs text-white/50 mt-3">This gift has been redeemed.</p>
          ) : (
            <p className="text-xs text-white/50 mt-3">Balance {inr(card.balance)} · Quote this code with our concierge to redeem.</p>
          )}
        </div>
      </div>

      <div className="mt-8">
        <GiftShare url={url} recipientName={card.recipientName} />
      </div>
      <p className="text-center text-xs text-ink-faint mt-6 print:hidden">
        To redeem, <a href="/contact" className="text-gold link-underline">contact our concierge</a> with your gift code, or apply it to any booking enquiry.
      </p>
    </div>
  );
}
