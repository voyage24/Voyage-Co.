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
    select: { id: true, authorName: true, rating: true, comment: true, createdAt: true },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <div className="flex items-center justify-between mb-6">
        <Link href="/hotels" className="inline-flex items-center gap-2 text-xs tracking-[0.1em] uppercase text-ink-muted hover:text-ink transition-colors">
          <ArrowLeft size={15} /> <T k="detail.allStays" />
        </Link>
        <SaveButton type="hotel" itemId={hotel.id} itemTitle={hotel.name} image={hotel.image} href={`/hotels/${hotel.id}`} label />
      </div>

      {/* Hero image */}
      <div className="relative rounded-2xl overflow-hidden aspect-[16/8] mb-8">
        <Image src={hotel.image} alt={hotel.name} fill sizes="100vw" className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-vc-950/40 to-transparent" />
        {hotel.badge && (
          <span className="absolute top-4 left-4 text-[10px] font-medium tracking-[0.15em] uppercase text-gold border border-gold/50 bg-vc-950/70 backdrop-blur-sm px-3 py-1 rounded-sm">
            {hotel.badge}
          </span>
        )}
      </div>

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
                  className="w-full h-full"
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
        </div>

        {/* Booking card */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-28 bg-panel border border-line rounded-2xl shadow-widget p-6">
            <div className="mb-5">
              <Price amount={hotel.pricePerNight} className="font-serif text-3xl font-light text-ink" />
              <p className="text-xs text-ink-faint font-light"><T k="card.perNightTaxes" /></p>
            </div>
            <Link
              href={`/book?type=hotel&id=${hotel.id}`}
              className="block w-full text-center py-4 bg-ink hover:bg-ink/90 text-page font-medium text-xs tracking-[0.16em] uppercase rounded-sm transition-colors mb-3"
            >
              <T k="card.reserve" />
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

      <ReviewsSection type="hotel" itemId={hotel.id} reviews={reviews} />
    </div>
  );
}
