import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, ArrowLeft, Phone, MapPin, Clock } from "lucide-react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Price from "@/components/ui/Price";
import ReviewsSection from "@/components/reviews/ReviewsSection";
import SaveButton from "@/components/ui/SaveButton";
import ShareButton from "@/components/ui/ShareButton";
import JsonLd from "@/components/seo/JsonLd";
import FaqAndEntry from "@/components/products/FaqAndEntry";
import DestinationCompanion from "@/components/products/DestinationCompanion";
import { resolveCoords } from "@/lib/place-coords";
import { countryForPlace } from "@/lib/place-country";
import CompareButton from "@/components/compare/CompareButton";
import RecordView from "@/components/products/RecordView";
import AddToItineraryButton from "@/components/itinerary/AddToItineraryButton";
import { productJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const cab = await prisma.outstationCab.findUnique({ where: { id: params.id } });
  if (!cab) return { title: "Outstation Cab — Voyages & Co." };
  const desc = `${cab.vehicleType} · ${cab.originCity} to ${cab.destinationCity} (${cab.tripType}).`;
  return {
    title: `${cab.title} — Voyages & Co.`,
    description: desc,
    openGraph: { title: cab.title, description: desc, images: [cab.image], type: "website" },
  };
}

export default async function OutstationCabDetailPage({ params }: { params: { id: string } }) {
  const cab = await prisma.outstationCab.findUnique({ where: { id: params.id } });
  if (!cab || !cab.published) notFound();

  const reviews = await prisma.review.findMany({
    where: { type: "outstation-cab", itemId: cab.id, status: "approved" },
    orderBy: { createdAt: "desc" },
    select: { id: true, authorName: true, rating: true, comment: true, createdAt: true, images: true },
  });

  const faqs = (cab.faqs as { q: string; a: string }[] | null) ?? [];

  const alsoLike = await prisma.outstationCab.findMany({
    where: { published: true, id: { not: cab.id }, originCity: cab.originCity },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
      <RecordView type="outstation-cab" id={cab.id} title={cab.title} image={cab.image} href={`/outstation-cabs/${cab.id}`} price={cab.priceOnRequest ? undefined : cab.price} />
      <JsonLd data={[productJsonLd({ type: "outstation-cab", id: cab.id, basePath: "/outstation-cabs", name: cab.title, description: cab.description, image: cab.image, price: cab.price, priceOnRequest: cab.priceOnRequest }, reviews), breadcrumbJsonLd([{ name: "Outstation Cabs", path: "/outstation-cabs" }, { name: cab.title, path: `/outstation-cabs/${cab.id}` }]), ...(faqs.length ? [faqJsonLd(faqs)] : [])]} />
      <div className="flex items-center justify-between mb-6">
        <Link href="/outstation-cabs" className="inline-flex items-center gap-2 text-xs tracking-[0.1em] uppercase text-ink-muted hover:text-gold transition-colors">
          <ArrowLeft size={15} /> All Outstation Cabs
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1">
          <AddToItineraryButton type="outstation-cab" id={cab.id} title={cab.title} image={cab.image} href={`/outstation-cabs/${cab.id}`} price={cab.priceOnRequest ? undefined : cab.price} label />
          <CompareButton type="outstation-cab" id={cab.id} title={cab.title} image={cab.image} href={`/outstation-cabs/${cab.id}`} label
            attrs={{ Price: cab.priceOnRequest ? "On request" : `₹${cab.price.toLocaleString("en-IN")}`, Vehicle: cab.vehicleType, Route: `${cab.originCity} → ${cab.destinationCity}`, "Trip type": cab.tripType }} />
          <SaveButton type="outstation-cab" itemId={cab.id} itemTitle={cab.title} image={cab.image} href={`/outstation-cabs/${cab.id}`} label />
          <ShareButton title={cab.title} text={cab.description || cab.title} path={`/outstation-cabs/${cab.id}`} label />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="relative rounded-2xl overflow-hidden aspect-[16/9] mb-6">
            <Image src={cab.image} alt={cab.title} fill sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover ken-burns" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-vc-950/40 to-transparent" />
            {cab.badge && (
              <span className="absolute top-4 left-4 text-[9px] font-medium tracking-[0.15em] uppercase text-gold border border-gold/50 bg-vc-950/70 backdrop-blur-sm px-3 py-1 rounded-sm">
                {cab.badge}
              </span>
            )}
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-ink-muted mb-2 font-light">
              <MapPin size={14} className="text-gold" />
              {cab.originCity} → {cab.destinationCity}
            </div>
            <p className="text-[11px] tracking-[0.18em] uppercase text-gold mb-1">{cab.vehicleType} · {cab.tripType}</p>
            <h1 className="font-serif text-3xl sm:text-4xl font-light text-ink mb-3">{cab.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-ink-muted font-light">
              {cab.durationEstimate && <span className="flex items-center gap-1.5"><Clock size={14} className="text-gold" /> {cab.durationEstimate}</span>}
              {cab.distanceKm != null && <span>{cab.distanceKm} km</span>}
            </div>
          </div>

          <div className="bg-panel rounded-2xl border border-line shadow-card p-6 mb-5">
            <h2 className="font-serif text-xl font-light text-ink mb-4">About this journey</h2>
            <p className="text-sm text-ink-muted font-light leading-relaxed">{cab.description}</p>
          </div>

          {cab.includes.length > 0 && (
            <div className="bg-panel rounded-2xl border border-line shadow-card p-6">
              <h2 className="font-serif text-xl font-light text-ink mb-4">What&apos;s Included</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {cab.includes.map(inc => (
                  <div key={inc} className="flex items-center gap-2 text-sm text-ink-muted font-light">
                    <CheckCircle size={15} className="text-gold shrink-0" />
                    {inc}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-28 bg-panel rounded-2xl border border-line shadow-widget p-6">
            <div className="mb-5">
              {cab.priceOnRequest ? (
                <p className="font-serif text-2xl font-light text-ink">Price on request</p>
              ) : (
                <>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-ink-faint font-light">{cab.tripType}</p>
                  <Price amount={cab.price} className="font-serif text-3xl font-light text-ink" />
                </>
              )}
            </div>

            <div className="space-y-2.5 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-ink-muted font-light">Route</span>
                <span className="font-medium text-ink">{cab.originCity} → {cab.destinationCity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-muted font-light">Vehicle</span>
                <span className="font-medium text-ink">{cab.vehicleType}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-muted font-light">Trip type</span>
                <span className="font-medium text-ink">{cab.tripType}</span>
              </div>
            </div>

            <Link href={cab.priceOnRequest ? "/contact" : `/book?type=outstation-cab&id=${cab.id}`} className="block w-full text-center py-3.5 bg-ink hover:bg-ink/90 text-page font-normal text-xs tracking-[0.14em] uppercase rounded-sm transition-colors mb-3">
              {cab.priceOnRequest ? "Enquire Now" : "Reserve Cab"}
            </Link>
            <Link href="/contact" className="block w-full text-center py-3 border border-line-strong text-ink font-normal text-xs tracking-[0.14em] uppercase rounded-sm hover:bg-ink hover:text-page transition-all">
              Customise Journey
            </Link>

            <div className="mt-5 pt-5 border-t border-line flex items-center gap-2 text-xs text-ink-muted font-light">
              <Phone size={13} className="text-gold" />
              <Link href="/contact" className="text-gold hover:underline">Speak to concierge</Link>
            </div>
          </div>
        </div>
      </div>

      <DestinationCompanion
        coords={resolveCoords(cab.destinationCity, cab.destinationCity)}
        country={countryForPlace(cab.destinationCity)}
        city={cab.destinationCity} name={cab.destinationCity} destKey={cab.id}
        heading={`Arriving in ${cab.destinationCity}`}
      />

      <FaqAndEntry faqs={faqs} entryRequirements={null} />

      <ReviewsSection type="outstation-cab" itemId={cab.id} reviews={reviews} />

      {alsoLike.length > 0 && (
        <section className="mt-16 border-t border-line pt-10">
          <h2 className="font-serif text-2xl font-light text-ink mb-6">More routes from {cab.originCity}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {alsoLike.map(c => (
              <Link key={c.id} href={`/outstation-cabs/${c.id}`} className="block bg-panel border border-line rounded-xl p-4 hover:border-gold/40 transition-colors">
                <p className="font-serif text-lg font-light text-ink">{c.title}</p>
                <p className="text-xs text-ink-muted font-light mt-1">{c.originCity} → {c.destinationCity}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
