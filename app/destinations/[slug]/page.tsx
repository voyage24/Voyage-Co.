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
import BestTimeToVisit from "@/components/products/BestTimeToVisit";
import GettingAround from "@/components/products/GettingAround";
import TippingGuide from "@/components/products/TippingGuide";
import ConnectivityGuide from "@/components/products/ConnectivityGuide";
import CurrencyCheatSheet from "@/components/products/CurrencyCheatSheet";
import TypicalCosts from "@/components/products/TypicalCosts";
import HealthSafety from "@/components/products/HealthSafety";
import LocalHolidays from "@/components/products/LocalHolidays";
import Phrasebook from "@/components/ui/Phrasebook";
import { getSeasonality } from "@/lib/seasonality";
import { getGettingAround } from "@/lib/getting-around";

export const revalidate = 300;

async function resolve(slug: string) {
  const destinations = await getDestinations();
  return destinations.find(d => d.slug === slug) ?? null;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const dest = await resolve(params.slug);
  if (!dest) return { title: "Destination — Voyages & Co." };
  const season = getSeasonality(dest.country);
  return {
    title: `${dest.country} Luxury Travel Guide — Stays, Experiences & Tips | Voyages & Co.`,
    description: season
      ? `Plan luxury travel to ${dest.country}: the finest curated stays and experiences, plus when to visit, getting around, tipping, currency and essentials. ${season.note}`
      : `Discover the finest stays, experiences and journeys in ${dest.country}, curated by Voyages & Co.`,
  };
}

export default async function DestinationPage({ params }: { params: { slug: string } }) {
  const dest = await resolve(params.slug);
  if (!dest) notFound();
  const country = dest.country;

  const hasGuide = !!getSeasonality(country) || !!getGettingAround(country);

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
            {hotels.map(h => <HotelCard key={h.id} hotel={h} vertical />)}
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

      {hasGuide && (
        <section className="mt-4 border-t border-line pt-12">
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-2">Travel guide</p>
          <h2 className="font-serif text-2xl sm:text-3xl font-light text-ink mb-2">Know before you go to {country}</h2>
          <p className="text-ink-muted font-light mb-8 max-w-2xl">When to visit, getting around, tipping, connectivity, currency and the practical essentials — everything our concierge would brief you on.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
            <BestTimeToVisit country={country} />
            <GettingAround country={country} />
            <HealthSafety country={country} />
            <TippingGuide country={country} />
            <ConnectivityGuide country={country} />
            <CurrencyCheatSheet country={country} />
            <TypicalCosts country={country} />
            <LocalHolidays country={country} />
            <Phrasebook country={country} />
          </div>
          <p className="text-xs text-ink-faint mt-8">
            Ready to go? <Link href="/plan" className="text-gold link-underline">Plan your {country} journey with a concierge →</Link>
          </p>
        </section>
      )}
    </div>
  );
}
