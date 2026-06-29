import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getDestinations } from "@/lib/destinations";
import HotelCard from "@/components/cards/HotelCard";
import ExperienceCard from "@/components/cards/ExperienceCard";
import CruiseCard from "@/components/cards/CruiseCard";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";

export const revalidate = 300;

async function resolve(slug: string) {
  const destinations = await getDestinations();
  return destinations.find(d => d.slug === slug) ?? null;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const dest = await resolve(params.slug);
  if (!dest) return { title: "Destination — Voyages & Co." };
  return {
    title: `${dest.country} — Luxury Travel | Voyages & Co.`,
    description: `Discover the finest stays, experiences and journeys in ${dest.country}, curated by Voyages & Co.`,
  };
}

export default async function DestinationPage({ params }: { params: { slug: string } }) {
  const dest = await resolve(params.slug);
  if (!dest) notFound();
  const country = dest.country;

  const [hotels, experiences, cruises] = await Promise.all([
    prisma.hotel.findMany({ where: { published: true, country }, take: 12 }),
    prisma.experience.findMany({ where: { published: true, country }, take: 8 }),
    prisma.cruise.findMany({ where: { published: true, OR: [{ region: { contains: country, mode: "insensitive" } }, { ports: { has: country } }] }, take: 6 }),
  ]);

  return (
    <div className="max-w-[1500px] mx-auto px-6 lg:px-12 pt-28 pb-20">
      <JsonLd data={[breadcrumbJsonLd([{ name: "Destinations", path: "/destinations" }, { name: country, path: `/destinations/${dest.slug}` }])]} />
      <Link href="/destinations" className="inline-flex items-center gap-2 text-xs tracking-[0.1em] uppercase text-ink-muted hover:text-ink mb-6 transition-colors">
        <ArrowLeft size={15} /> All destinations
      </Link>

      <div className="mb-10">
        <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-2">Destination</p>
        <h1 className="font-serif text-4xl sm:text-5xl font-light text-ink">{country}</h1>
        <p className="text-ink-muted font-light mt-3 max-w-2xl">The finest stays, experiences and voyages we&apos;ve curated across {country}.</p>
      </div>

      {hotels.length > 0 && (
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-light text-ink mb-5">Stays in {country}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map(h => <HotelCard key={h.id} hotel={h} />)}
          </div>
        </section>
      )}

      {experiences.length > 0 && (
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-light text-ink mb-5">Experiences in {country}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiences.map(e => <ExperienceCard key={e.id} exp={e} />)}
          </div>
        </section>
      )}

      {cruises.length > 0 && (
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-light text-ink mb-5">Voyages near {country}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cruises.map(c => <CruiseCard key={c.id} cruise={c} />)}
          </div>
        </section>
      )}

      {hotels.length === 0 && experiences.length === 0 && cruises.length === 0 && (
        <p className="text-ink-muted font-light">New journeys to {country} are coming soon. <Link href="/plan" className="text-gold link-underline">Plan a bespoke trip →</Link></p>
      )}
    </div>
  );
}
