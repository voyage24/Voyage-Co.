import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, CheckCircle, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Price from "@/components/ui/Price";
import T from "@/components/ui/T";
import ReviewsSection from "@/components/reviews/ReviewsSection";
import SaveButton from "@/components/ui/SaveButton";
import ShareButton from "@/components/ui/ShareButton";
import JsonLd from "@/components/seo/JsonLd";
import FaqAndEntry from "@/components/products/FaqAndEntry";
import CompareButton from "@/components/compare/CompareButton";
import RecordView from "@/components/products/RecordView";
import AddToItineraryButton from "@/components/itinerary/AddToItineraryButton";
import PhotoGallery from "@/components/ui/PhotoGallery";
import HotelCard from "@/components/cards/HotelCard";
import PropertyMap from "@/components/ui/PropertyMap";
import DestinationWeather from "@/components/ui/DestinationWeather";
import DestinationEssentials from "@/components/ui/DestinationEssentials";
import DirectionsButton from "@/components/ui/DirectionsButton";
import PackingList from "@/components/ui/PackingList";
import Phrasebook from "@/components/ui/Phrasebook";
import LocalActivities from "@/components/products/LocalActivities";
import { getHotelCityCoords } from "@/lib/hotel-coords";
import { hotelJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const hotel = await prisma.hotel.findUnique({ where: { id: params.id } });
  if (!hotel) return { title: "Stay — Voyages & Co." };
  const desc = `${hotel.location} · ${hotel.category}. ${hotel.description}`.slice(0, 200);
  return {
    title: `${hotel.name} — Voyages & Co.`,
    description: desc,
    openGraph: { title: hotel.name, description: desc, images: [hotel.image], type: "website" },
  };
}

export default async function HotelDetailPage({ params }: { params: { id: string } }) {
  const hotel = await prisma.hotel.findUnique({ where: { id: params.id } });
  if (!hotel || !hotel.published) notFound();

  const reviews = await prisma.review.findMany({
    where: { type: "hotel", itemId: hotel.id, status: "approved" },
    orderBy: { createdAt: "desc" },
    select: { id: true, authorName: true, rating: true, comment: true, createdAt: true, images: true },
  });

  const faqs = (hotel.faqs as { q: string; a: string }[] | null) ?? [];

  // Local experiences & activities near this stay — prefer the same city, then
  // fall back to the same country.
  const nearbyRaw = await prisma.experience.findMany({
    where: { published: true, OR: [{ location: { contains: hotel.city, mode: "insensitive" } }, { country: hotel.country }] },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: { id: true, title: true, location: true, image: true, category: true, duration: true },
  });
  const nearby = nearbyRaw
    .sort((a, b) => Number(b.location.toLowerCase().includes(hotel.city.toLowerCase())) - Number(a.location.toLowerCase().includes(hotel.city.toLowerCase())))
    .slice(0, 3);

  // "You may also like" — other stays, ranked by how much they share with this
  // one (same city > region > category).
  const similarRaw = await prisma.hotel.findMany({
    where: { published: true, id: { not: hotel.id }, OR: [{ city: hotel.city }, { region: hotel.region }, { category: hotel.category }] },
    take: 12,
  });
  const alsoLike = similarRaw
    .map(h => ({ h, score: (h.city === hotel.city ? 3 : 0) + (h.region === hotel.region ? 2 : 0) + (h.category === hotel.category ? 1 : 0) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(x => x.h);

  // Use the property's own coordinates, else fall back to its city centre so
  // the Location map + weather still show.
  const cityCoords = getHotelCityCoords(hotel.city);
  const coords: [number, number] | null = hotel.lat != null && hotel.lng != null ? [hotel.lat, hotel.lng] : cityCoords;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <RecordView type="hotel" id={hotel.id} title={hotel.name} image={hotel.image} href={`/hotels/${hotel.id}`} />
      <JsonLd data={[hotelJsonLd(hotel, reviews), breadcrumbJsonLd([{ name: "Stays", path: "/hotels" }, { name: hotel.name, path: `/hotels/${hotel.id}` }]), ...(faqs.length ? [faqJsonLd(faqs)] : [])]} />
      <div className="flex items-center justify-between mb-6">
        <Link href="/hotels" className="inline-flex items-center gap-2 text-xs tracking-[0.1em] uppercase text-ink-muted hover:text-ink transition-colors">
          <ArrowLeft size={15} /> <T k="detail.allStays" />
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1">
          <AddToItineraryButton type="hotel" id={hotel.id} title={hotel.name} image={hotel.image} href={`/hotels/${hotel.id}`} price={hotel.priceOnRequest ? undefined : hotel.pricePerNight} label />
          <CompareButton type="hotel" id={hotel.id} title={hotel.name} image={hotel.image} href={`/hotels/${hotel.id}`} label
            attrs={{ Price: hotel.priceOnRequest ? "On request" : `₹${hotel.pricePerNight.toLocaleString("en-IN")}/night`, Rating: `${hotel.rating} (${hotel.reviewCount})`, Stars: `${hotel.stars}★`, Location: hotel.location, Category: hotel.category }} />
          <SaveButton type="hotel" itemId={hotel.id} itemTitle={hotel.name} image={hotel.image} href={`/hotels/${hotel.id}`} label />
          <ShareButton title={hotel.name} text={`${hotel.name} — ${hotel.location}`} path={`/hotels/${hotel.id}`} label />
        </div>
      </div>

      {/* Hero gallery */}
      <PhotoGallery images={[hotel.image, ...hotel.images]} alt={hotel.name} badge={hotel.badge} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-0.5 mb-2">
            {Array.from({ length: hotel.stars }).map((_, i) => (
              <Star key={i} size={13} className="text-gold fill-gold" />
            ))}
            <span className="ml-2 text-[11px] tracking-[0.12em] uppercase text-ink-faint">{hotel.category}</span>
          </div>
          <h1 className="font-serif text-4xl font-light text-ink mb-2">{hotel.name}</h1>
          <p className="text-sm text-ink-muted font-light flex items-center gap-1.5 mb-4">
            <MapPin size={14} className="text-gold" /> {hotel.location}
          </p>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1.5 border border-gold/40 text-gold px-3 py-1.5 rounded-sm">
              <span className="font-medium">{hotel.rating}</span>
              <Star size={12} className="fill-gold text-gold" />
            </div>
            <span className="text-sm text-ink-muted font-light">{hotel.reviewCount.toLocaleString()} <T k="card.memberReviews" /></span>
          </div>

          <div className="bg-panel-soft border border-line rounded-xl p-6 mb-8">
            <p className="text-base text-ink-muted font-light leading-relaxed">{hotel.description}</p>
          </div>

          <div className="border-t border-line pt-8 mb-8">
            <h2 className="font-serif text-2xl font-light text-ink mb-4"><T k="detail.theExperience" /></h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {hotel.highlights.map(h => (
                <li key={h} className="flex items-center gap-2 text-sm text-ink-muted font-light">
                  <CheckCircle size={14} className="text-gold shrink-0" /> {h}
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-line pt-8">
            <h2 className="font-serif text-2xl font-light text-ink mb-4"><T k="hotelsPage.amenities" /></h2>
            <div className="flex flex-wrap gap-2">
              {hotel.amenities.map(a => (
                <span key={a} className="text-xs text-ink-muted bg-panel-soft border border-line px-3 py-1.5 rounded-full font-light">
                  {a}
                </span>
              ))}
            </div>
          </div>

          {hotel.lat != null && hotel.lng != null && (
            <div className="border-t border-line pt-8 mt-8">
              <h2 className="font-serif text-2xl font-light text-ink mb-4"><T k="detail.location" /></h2>
              <div className="rounded-xl overflow-hidden border border-line aspect-[16/9]">
                <iframe
                  src={`https://maps.google.com/maps?q=${hotel.lat},${hotel.lng}&z=14&output=embed`}
                  className="w-full h-full dark:brightness-[0.82] dark:contrast-95"
                  loading="lazy"
                  title={`Map showing ${hotel.name}`}
                />
              </div>
              {hotel.officialSite && (
                <a
                  href={hotel.officialSite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-xs tracking-[0.1em] uppercase text-gold hover:underline"
                >
                  <T k="detail.visitOfficialSite" /> →
                </a>
              )}
            </div>
          )}

          <LocalActivities items={nearby} place={hotel.city} />
        </div>

        {/* Booking card */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-28 bg-panel border border-line rounded-2xl shadow-widget p-6">
            <div className="mb-5">
              {hotel.priceOnRequest ? (
                <p className="font-serif text-2xl font-light text-ink"><T k="detail.priceOnRequest" /></p>
              ) : (
                <>
                  <Price amount={hotel.pricePerNight} className="font-serif text-3xl font-light text-ink" />
                  <p className="text-xs text-ink-faint font-light"><T k="card.perNightTaxes" /></p>
                </>
              )}
            </div>
            <Link
              href={hotel.priceOnRequest ? "/contact" : `/book?type=hotel&id=${hotel.id}`}
              className="block w-full text-center py-4 bg-ink hover:bg-ink/90 text-page font-medium text-xs tracking-[0.16em] uppercase rounded-sm transition-colors mb-3"
            >
              <T k={hotel.priceOnRequest ? "detail.enquireNow" : "card.reserve"} />
            </Link>
            <Link
              href="/contact"
              className="block w-full text-center py-3.5 border border-line-strong text-ink font-medium text-xs tracking-[0.14em] uppercase rounded-sm hover:bg-ink hover:text-page transition-all"
            >
              <T k="detail.askTheConcierge" />
            </Link>
            <p className="text-[10px] text-ink-faint font-light text-center mt-4">
              <T k="detail.noPaymentTaken" />
            </p>
          </div>
        </div>
      </div>

      {coords && (
        <section className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="font-serif text-2xl font-light text-ink">Location</h2>
            <div className="flex items-center gap-4">
              <DirectionsButton lat={coords[0]} lng={coords[1]} name={hotel.name} />
              <DestinationWeather lat={coords[0]} lng={coords[1]} />
            </div>
          </div>
          <PropertyMap lat={coords[0]} lng={coords[1]} name={hotel.name} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <DestinationEssentials country={hotel.country} city={hotel.city} />
            <PackingList lat={coords[0]} lng={coords[1]} destinationKey={hotel.id} />
          </div>
          <div className="mt-4"><Phrasebook country={hotel.country} /></div>
        </section>
      )}

      <FaqAndEntry faqs={faqs} entryRequirements={hotel.entryRequirements} />

      <ReviewsSection type="hotel" itemId={hotel.id} reviews={reviews} />

      {alsoLike.length > 0 && (
        <section className="mt-16 border-t border-line pt-10">
          <h2 className="font-serif text-2xl font-light text-ink mb-6"><T k="detail.youMayAlsoLike" /></h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {alsoLike.map(h => <HotelCard key={h.id} hotel={h} />)}
          </div>
        </section>
      )}
    </div>
  );
}
