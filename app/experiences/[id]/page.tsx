import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, CheckCircle, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Price from "@/components/ui/Price";
import T from "@/components/ui/T";
import ReviewsSection from "@/components/reviews/ReviewsSection";
import ExperienceCard from "@/components/cards/ExperienceCard";
import SaveButton from "@/components/ui/SaveButton";
import ShareButton from "@/components/ui/ShareButton";
import DirectionsButton from "@/components/ui/DirectionsButton";
import JsonLd from "@/components/seo/JsonLd";
import FaqAndEntry from "@/components/products/FaqAndEntry";
import DestinationCompanion from "@/components/products/DestinationCompanion";
import { resolveCoords } from "@/lib/place-coords";
import CompareButton from "@/components/compare/CompareButton";
import RecordView from "@/components/products/RecordView";
import AddToItineraryButton from "@/components/itinerary/AddToItineraryButton";
import PhotoGallery from "@/components/ui/PhotoGallery";
import { productJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const exp = await prisma.experience.findUnique({ where: { id: params.id } });
  if (!exp) return { title: "Experience — Voyages & Co." };
  const desc = `${exp.location} · ${exp.duration}. ${exp.description}`.slice(0, 200);
  return {
    title: `${exp.title} — Voyages & Co.`,
    description: desc,
    openGraph: { title: exp.title, description: desc, images: [exp.image], type: "website" },
  };
}

export default async function ExperienceDetailPage({ params }: { params: { id: string } }) {
  const exp = await prisma.experience.findUnique({ where: { id: params.id } });
  if (!exp || !exp.published) notFound();

  const reviews = await prisma.review.findMany({
    where: { type: "experience", itemId: exp.id, status: "approved" },
    orderBy: { createdAt: "desc" },
    select: { id: true, authorName: true, rating: true, comment: true, createdAt: true, images: true },
  });

  const faqs = (exp.faqs as { q: string; a: string }[] | null) ?? [];

  // "You may also like" — experiences ranked by shared country then category.
  const similarRaw = await prisma.experience.findMany({
    where: { published: true, id: { not: exp.id }, OR: [{ country: exp.country }, { category: exp.category }] },
    take: 12,
  });
  const alsoLike = similarRaw
    .map(e => ({ e, score: (e.country === exp.country ? 2 : 0) + (e.category === exp.category ? 1 : 0) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(x => x.e);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <RecordView type="experience" id={exp.id} title={exp.title} image={exp.image} href={`/experiences/${exp.id}`} price={exp.priceOnRequest ? undefined : exp.price} />
      <JsonLd data={[productJsonLd({ type: "experience", id: exp.id, basePath: "/experiences", name: exp.title, description: exp.description, image: exp.image, price: exp.price, priceOnRequest: exp.priceOnRequest }, reviews), breadcrumbJsonLd([{ name: "Experiences", path: "/experiences" }, { name: exp.title, path: `/experiences/${exp.id}` }]), ...(faqs.length ? [faqJsonLd(faqs)] : [])]} />
      <div className="flex items-center justify-between mb-6">
        <Link href="/experiences" className="inline-flex items-center gap-2 text-xs tracking-[0.1em] uppercase text-ink-muted hover:text-ink transition-colors">
          <ArrowLeft size={15} /> <T k="detail.allExperiences" />
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1">
          <AddToItineraryButton type="experience" id={exp.id} title={exp.title} image={exp.image} href={`/experiences/${exp.id}`} price={exp.priceOnRequest ? undefined : exp.price} label />
          <CompareButton type="experience" id={exp.id} title={exp.title} image={exp.image} href={`/experiences/${exp.id}`} label
            attrs={{ Price: exp.priceOnRequest ? "On request" : `₹${exp.price.toLocaleString("en-IN")} pp`, Duration: exp.duration, Location: exp.location, Category: exp.category }} />
          <SaveButton type="experience" itemId={exp.id} itemTitle={exp.title} image={exp.image} href={`/experiences/${exp.id}`} label />
          <ShareButton title={exp.title} text={`${exp.title} — ${exp.location}`} path={`/experiences/${exp.id}`} label />
          {exp.lat != null && exp.lng != null && <DirectionsButton lat={exp.lat} lng={exp.lng} name={exp.title} />}
        </div>
      </div>

      {/* Hero */}
      <PhotoGallery images={[exp.image]} alt={exp.title} badge={exp.badge} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main */}
        <div className="lg:col-span-2">
          <p className="text-[11px] tracking-[0.12em] uppercase text-gold mb-2 capitalize">{exp.category}</p>
          <h1 className="font-serif text-4xl font-light text-ink mb-2">{exp.title}</h1>
          <p className="text-sm text-ink-muted font-light flex items-center gap-1.5 mb-4">
            <MapPin size={14} className="text-gold" /> {exp.location}
          </p>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1.5 border border-gold/40 text-gold px-3 py-1.5 rounded-sm">
              <Clock size={12} className="text-gold" />
              <span className="text-sm font-medium">{exp.duration}</span>
            </div>
            <span className="text-sm text-ink-muted font-light">{exp.country}</span>
          </div>

          <div className="bg-panel-soft border border-line rounded-xl p-6 mb-8">
            <p className="text-base text-ink-muted font-light leading-relaxed">{exp.description}</p>
          </div>

          <div className="border-t border-line pt-8">
            <h2 className="font-serif text-2xl font-light text-ink mb-4"><T k="detail.whatsIncluded" /></h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {exp.includes.map(inc => (
                <li key={inc} className="flex items-center gap-2 text-sm text-ink-muted font-light">
                  <CheckCircle size={14} className="text-gold shrink-0" /> {inc}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Booking card */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-28 bg-panel border border-line rounded-2xl shadow-widget p-6">
            <div className="mb-5">
              {exp.priceOnRequest ? (
                <p className="font-serif text-2xl font-light text-ink"><T k="detail.priceOnRequest" /></p>
              ) : (
                <>
                  <Price amount={exp.price} className="font-serif text-3xl font-light text-ink" />
                  <p className="text-xs text-ink-faint font-light"><T k="detail.perPerson" /></p>
                </>
              )}
            </div>
            <Link
              href={exp.priceOnRequest ? "/contact" : `/book?type=experience&id=${exp.id}`}
              className="block w-full text-center py-4 bg-ink hover:bg-ink/90 text-page font-medium text-xs tracking-[0.16em] uppercase rounded-sm transition-colors mb-3"
            >
              <T k={exp.priceOnRequest ? "detail.enquireNow" : "card.reserve"} />
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

      <DestinationCompanion
        coords={exp.lat != null && exp.lng != null ? [exp.lat, exp.lng] as [number, number] : resolveCoords(exp.location)}
        country={exp.country} city={exp.location} name={exp.title} destKey={exp.id}
      />

      <FaqAndEntry faqs={faqs} entryRequirements={exp.entryRequirements} />

      <ReviewsSection type="experience" itemId={exp.id} reviews={reviews} />

      {alsoLike.length > 0 && (
        <section className="mt-16 border-t border-line pt-10">
          <h2 className="font-serif text-2xl font-light text-ink mb-6"><T k="detail.youMayAlsoLike" /></h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {alsoLike.map(e => <ExperienceCard key={e.id} exp={e} />)}
          </div>
        </section>
      )}
    </div>
  );
}
