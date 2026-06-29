import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getDestinations } from "@/lib/destinations";
import Reveal from "@/components/ui/Reveal";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Destinations — Voyages & Co.",
  description: "Explore our world of luxury travel by destination — handpicked stays, experiences and journeys across the globe.",
};

export default async function DestinationsPage() {
  const destinations = await getDestinations();

  return (
    <div className="max-w-[1500px] mx-auto px-6 lg:px-12 pt-28 pb-20">
      <div className="text-center mb-12">
        <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-3">Explore</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-3">Destinations</h1>
        <p className="text-ink-muted font-light max-w-xl mx-auto">A world of extraordinary places, each with its own collection of stays, experiences and journeys.</p>
      </div>

      <Reveal stagger className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {destinations.map(d => (
          <Link key={d.slug} href={`/destinations/${d.slug}`} className="group relative aspect-[3/4] rounded-2xl overflow-hidden">
            <Image src={d.image} alt={d.country} fill sizes="(max-width:640px) 50vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-vc-950/80 via-vc-950/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-5">
              <h2 className="font-serif text-xl font-light text-[#f4f0e9]">{d.country}</h2>
              <p className="text-[11px] tracking-[0.1em] uppercase text-white/70 mt-0.5">{d.count} {d.count === 1 ? "stay" : "stays"}</p>
            </div>
          </Link>
        ))}
      </Reveal>
    </div>
  );
}
