import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, ArrowLeft, Phone, MapPin, Clock, Star } from "lucide-react";
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
  const stay = await prisma.hourlyStay.findUnique({ where: { id: params.id } });
  if (!stay) return { title: "Hourly Stay — Voyages & Co." };
  const desc = `${stay.hours}-hour day-use stay in ${stay.city}. ${stay.category}.`;
  return {
    title: `${stay.title} — Voyages & Co.`,
    description: desc,
    openGraph: { title: stay.title, description: desc, images: [stay.image], type: "website" },
  };
}

export default async function HourlyStayDetailPage({ params }: { params: { id: string } }) {
  const stay = await prisma.hourlyStay.findUnique({ where: { id: params.id } });
  if (!stay || !stay.published) notFound();

  const reviews = await prisma.review.findMany({
    where: { type: "hourly-stay", itemId: stay.id, status: "approved" },
    orderBy: { createdAt: "desc" },
    select: { id: true, authorName: true, rating: true, comment: true, createdAt: true, images: true },
  });

  const faqs = (stay.faqs as { q: string; a: string }[] | null) ?? [];

  const alsoLike = await prisma.hourlyStay.findMany({
    where: { published: true, id: { not: stay.id }, city: stay.city },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
      <RecordView type="hourly-stay" id={stay.id} title={stay.title} image={stay.image} href={`/hourly-stays/${stay.id}`} price={stay.priceOnRequest ? undefined : stay.price} />
      <JsonLd data={[productJsonLd({ type: "hourly-stay", id: stay.id, basePath: "/hourly-stays", name: stay.title, description: stay.description, image: stay.image, price: stay.price, priceOnRequest: stay.priceOnRequest, rating: stay.rating ?? undefined, reviewCount: reviews.length || undefined }, reviews), breadcrumbJsonLd([{ name: "Hourly Stays", path: "/hourly-stays" }, { name: stay.title, path: `/hourly-stays/${stay.id}` }]), ...(faqs.length ? [faqJsonLd(faqs)] : [])]} />
      <div className="flex items-center justify-between mb-6">
        <Link href="/hourly-stays" className="inline-flex items-center gap-2 text-xs tracking-[0.1em] uppercase text-ink-muted hover:text-gold transition-colors">
          <ArrowLeft size={15} /> All Hourly Stays
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1">
          <AddToItineraryButton type="hourly-stay" id={stay.id} title={stay.title} image={stay.image} href={`/hourly-stays/${stay.id}`} price={stay.priceOnRequest ? undefined : stay.price} label />
          <CompareButton type="hourly-stay" id={stay.id} title={stay.title} image={stay.image} href={`/hourly-stays/${stay.id}`} label
            attrs={{ Price: stay.priceOnRequest ? "On request" : `₹${stay.price.toLocaleString("en-IN")}`, Duration: `${stay.hours}h`, City: stay.city, Category: stay.category }} />
          <SaveButton type="hourly-stay" itemId={stay.id} itemTitle={stay.title} image={stay.image} href={`/hourly-stays/${stay.id}`} label />
          <ShareButton title={stay.title} text={stay.description || stay.title} path={`/hourly-stays/${stay.id}`} label />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="relative rounded-2xl overflow-hidden aspect-[16/9] mb-6">
            <Image src={stay.image} alt={stay.title} fill sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover ken-burns" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-vc-950/40 to-transparent" />
            {stay.badge && (
              <span className="absolute top-4 left-4 text-[9px] font-medium tracking-[0.15em] uppercase text-gold border border-gold/50 bg-vc-950/70 backdrop-blur-sm px-3 py-1 rounded-sm">
                {stay.badge}
              </span>
            )}
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-ink-muted mb-2 font-light">
              <MapPin size={14} className="text-gold" />
              {stay.location || stay.city}
            </div>
            <p className="text-[11px] tracking-[0.18em] uppercase text-gold mb-1">{stay.category}</p>
            <h1 className="font-serif text-3xl sm:text-4xl font-light text-ink mb-3">{stay.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-ink-muted font-light">
              <span className="flex items-center gap-1.5"><Clock size={14} className="text-gold" /> {stay.hours}-hour day use</span>
              {stay.rating != null && <span className="flex items-center gap-1.5"><Star size={14} className="fill-gold text-gold" /> {stay.rating.toFixed(1)}</span>}
            </div>
          </div>

          <div className="bg-panel rounded-2xl border border-line shadow-card p-6 mb-5">
            <h2 className="font-serif text-xl font-light text-ink mb-4">About this stay</h2>
            <p className="text-sm text-ink-muted font-light leading-relaxed">{stay.description}</p>
          </div>

          {stay.amenities.length > 0 && (
            <div className="bg-panel rounded-2xl border border-line shadow-card p-6">
              <h2 className="font-serif text-xl font-light text-ink mb-4">Amenities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {stay.amenities.map(a => (
                  <div key={a} className="flex items-center gap-2 text-sm text-ink-muted font-light">
                    <CheckCircle size={15} className="text-gold shrink-0" />
                    {a}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-28 bg-panel rounded-2xl border border-line shadow-widget p-6">
            <div className="mb-5">
              {stay.priceOnRequest ? (
                <p className="font-serif text-2xl font-light text-ink">Price on request</p>
              ) : (
                <>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-ink-faint font-light">For {stay.hours} hours</p>
                  <Price amount={stay.price} className="font-serif text-3xl font-light text-ink" />
                </>
              )}
            </div>

            <div className="space-y-2.5 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-ink-muted font-light">City</span>
                <span className="font-medium text-ink">{stay.city}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-muted font-light">Duration</span>
                <span className="font-medium text-ink">{stay.hours} hours</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-muted font-light">Category</span>
                <span className="font-medium text-ink">{stay.category}</span>
              </div>
            </div>

            <Link href={stay.priceOnRequest ? "/contact" : `/book?type=hourly-stay&id=${stay.id}`} className="block w-full text-center py-3.5 bg-ink hover:bg-ink/90 text-page font-normal text-xs tracking-[0.14em] uppercase rounded-sm transition-colors mb-3">
              {stay.priceOnRequest ? "Enquire Now" : "Reserve Stay"}
            </Link>
            <Link href="/contact" className="block w-full text-center py-3 border border-line-strong text-ink font-normal text-xs tracking-[0.14em] uppercase rounded-sm hover:bg-ink hover:text-page transition-all">
              Speak to Concierge
            </Link>

            <div className="mt-5 pt-5 border-t border-line flex items-center gap-2 text-xs text-ink-muted font-light">
              <Phone size={13} className="text-gold" />
              <Link href="/contact" className="text-gold hover:underline">Speak to concierge</Link>
            </div>
          </div>
        </div>
      </div>

      <DestinationCompanion
        coords={resolveCoords(stay.city, stay.location)}
        country={countryForPlace(stay.city)}
        city={stay.city} name={stay.city} destKey={stay.id}
        heading={`Around ${stay.city}`}
      />

      <FaqAndEntry faqs={faqs} entryRequirements={null} />

      <ReviewsSection type="hourly-stay" itemId={stay.id} reviews={reviews} />

      {alsoLike.length > 0 && (
        <section className="mt-16 border-t border-line pt-10">
          <h2 className="font-serif text-2xl font-light text-ink mb-6">More hourly stays in {stay.city}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {alsoLike.map(s => (
              <Link key={s.id} href={`/hourly-stays/${s.id}`} className="block bg-panel border border-line rounded-xl p-4 hover:border-gold/40 transition-colors">
                <p className="font-serif text-lg font-light text-ink">{s.title}</p>
                <p className="text-xs text-ink-muted font-light mt-1">{s.hours}h · {s.category}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
