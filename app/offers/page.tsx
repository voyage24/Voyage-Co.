import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Lock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Offers — Voyages & Co.", description: "Exclusive offers and member-only rates on luxury journeys." };

export default async function OffersPage() {
  const customer = await getCurrentCustomer();
  const offers = await prisma.offer.findMany({
    where: { published: true, ...(customer ? {} : { memberOnly: false }) },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  const hiddenMemberOffers = customer ? 0 : await prisma.offer.count({ where: { published: true, memberOnly: true } });

  return (
    <div className="max-w-[1500px] mx-auto px-6 lg:px-12 pt-28 pb-20">
      <div className="text-center mb-12">
        <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-3">Exclusive</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-3">Offers</h1>
        <p className="text-ink-muted font-light max-w-xl mx-auto">Curated offers and member-only rates on extraordinary journeys.</p>
      </div>

      {offers.length === 0 ? (
        <p className="text-center text-ink-muted font-light">No offers at the moment — <Link href="/plan" className="text-gold link-underline">plan a bespoke journey</Link> instead.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map(o => {
            const card = (
              <div className="group bg-panel border border-line rounded-2xl overflow-hidden h-full hover:border-gold/40 transition-colors">
                <div className="relative aspect-[16/10]">
                  <Image src={o.image} alt={o.title} fill sizes="(max-width:640px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  {o.badge && <span className="absolute top-3 left-3 text-[10px] font-medium tracking-[0.15em] uppercase text-gold border border-gold/50 bg-vc-950/70 backdrop-blur-sm px-3 py-1 rounded-sm">{o.badge}</span>}
                  {o.memberOnly && <span className="absolute top-3 right-3 text-[10px] tracking-[0.12em] uppercase text-white bg-vc-950/70 px-2.5 py-1 rounded-sm">Member</span>}
                </div>
                <div className="p-5">
                  <h3 className="font-serif text-xl font-light text-ink mb-1.5">{o.title}</h3>
                  <p className="text-sm text-ink-muted font-light leading-relaxed">{o.description}</p>
                </div>
              </div>
            );
            return o.href ? <Link key={o.id} href={o.href}>{card}</Link> : <div key={o.id}>{card}</div>;
          })}
        </div>
      )}

      {hiddenMemberOffers > 0 && (
        <div className="mt-10 bg-panel border border-line rounded-2xl p-8 text-center">
          <Lock size={20} className="text-gold mx-auto mb-3" />
          <p className="font-serif text-xl font-light text-ink mb-1">{hiddenMemberOffers} member-only {hiddenMemberOffers === 1 ? "offer" : "offers"} await</p>
          <p className="text-ink-muted font-light mb-5">Sign in or create a free account to unlock exclusive member rates.</p>
          <Link href="/login" className="inline-block px-7 py-3 bg-ink text-page text-xs tracking-[0.16em] uppercase rounded-sm hover:bg-ink/90 transition-colors">Sign in to unlock</Link>
        </div>
      )}
    </div>
  );
}
