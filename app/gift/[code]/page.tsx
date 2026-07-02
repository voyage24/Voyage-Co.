import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
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
      {/* The champagne gift card */}
      <div
        className="relative rounded-2xl overflow-hidden shadow-luxury border border-[#c9ae77]"
        style={{ background: "linear-gradient(145deg,#f9f3e6 0%,#efe2c8 55%,#e7d9ba 100%)" }}
      >
        {/* Ornamental double-line frame */}
        <div className="pointer-events-none absolute inset-3 rounded-xl border border-[#c9ae77]/70" />
        <div className="pointer-events-none absolute inset-[14px] rounded-lg border border-[#c9ae77]/30" />

        {/* Wax-seal emblem */}
        <div
          className="absolute top-6 right-6 w-16 h-16 rounded-full border border-[#c9ae77] flex flex-col items-center justify-center text-[#8a6d3b] shadow-sm"
          style={{ background: "radial-gradient(circle at 35% 30%,#f6ecd6,#e3cfa3)" }}
        >
          <Sparkles size={16} />
          <span className="text-[7px] tracking-[0.22em] mt-0.5">V&amp;CO</span>
        </div>

        <div className="relative px-8 sm:px-14 py-12 text-center text-[#2a241c]">
          <div className="relative h-12 w-64 max-w-full mx-auto mb-3">
            <Image src="/logo-navy.png" alt="Voyages & Co." fill sizes="256px" className="object-contain" />
          </div>
          <p className="text-[10px] tracking-[0.34em] uppercase text-[#8a6d3b] mb-8">The gift of travel</p>

          {card.recipientName && (
            <p className="font-serif text-2xl font-light mb-2">Dear {card.recipientName},</p>
          )}
          <p className="text-[#6b6049] font-light mb-6">{card.senderName ? `${card.senderName} has gifted you` : "You have been gifted"}</p>

          <p className="font-serif text-6xl sm:text-7xl font-light text-[#8a6d3b] mb-2">{inr(card.amount)}</p>
          <p className="text-[11px] tracking-[0.18em] uppercase text-[#6b6049] mb-8">towards an extraordinary journey</p>

          {card.message && (
            <p className="font-serif text-lg font-light italic text-[#403828] max-w-md mx-auto mb-8">&ldquo;{card.message}&rdquo;</p>
          )}

          <div className="inline-block border border-[#c9ae77] rounded-sm px-6 py-3 mb-2 bg-[#fbf6ea]/60">
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#8a6d3b]/80 mb-1">Gift code</p>
            <p className="font-mono text-xl tracking-[0.2em] text-[#2a241c]">{card.code}</p>
          </div>
          {card.status === "redeemed" ? (
            <p className="text-xs text-[#6b6049] mt-3">This gift has been redeemed.</p>
          ) : (
            <p className="text-xs text-[#6b6049] mt-3">Balance {inr(card.balance)} · Quote this code with our concierge to redeem.</p>
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
