import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "A Curated Collection — Voyages & Co.",
  description: "A shared selection of journeys, stays and experiences from Voyages & Co.",
};

export default async function BoardPage({ params }: { params: { token: string } }) {
  const customer = await prisma.customer.findUnique({
    where: { shareToken: params.token },
    select: { name: true, saved: { orderBy: { createdAt: "desc" } } },
  });
  if (!customer) notFound();

  const firstName = customer.name?.split(" ")[0];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
      <div className="text-center mb-12">
        <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-3">A Curated Collection</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-3">
          {firstName ? `${firstName}'s Shortlist` : "A Shared Shortlist"}
        </h1>
        <p className="text-ink-muted font-light">Hand-picked from Voyages &amp; Co.</p>
      </div>

      {customer.saved.length === 0 ? (
        <p className="text-center text-ink-muted font-light">This collection is empty.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {customer.saved.map(s => (
            <Link key={s.id} href={s.href} className="group rounded-2xl overflow-hidden bg-panel border border-line hover:border-gold/40 shadow-card transition-colors">
              <div className="relative aspect-[16/10] overflow-hidden">
                {s.image && <Image src={s.image} alt={s.itemTitle} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />}
              </div>
              <div className="p-5">
                <p className="text-[10px] tracking-[0.18em] uppercase text-gold mb-1">{s.type}</p>
                <h2 className="font-serif text-lg font-light text-ink leading-snug">{s.itemTitle}</h2>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="text-center mt-14">
        <Link href="/plan" className="inline-block px-7 py-3.5 bg-ink text-page text-xs tracking-[0.16em] uppercase rounded-sm hover:bg-ink/90 transition-colors">
          Plan a Journey
        </Link>
      </div>
    </div>
  );
}
