import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, CheckCircle, ArrowLeft, Phone, Anchor, Star } from "lucide-react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Price from "@/components/ui/Price";
import T from "@/components/ui/T";
import ReviewsSection from "@/components/reviews/ReviewsSection";
import SaveButton from "@/components/ui/SaveButton";
import JsonLd from "@/components/seo/JsonLd";
import FaqAndEntry from "@/components/products/FaqAndEntry";
import CompareButton from "@/components/compare/CompareButton";
import RecordView from "@/components/products/RecordView";
import { productJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const cruise = await prisma.cruise.findUnique({ where: { id: params.id } });
  if (!cruise) return { title: "Cruise — Voyages & Co." };
  const desc = `${cruise.cruiseLine} · ${cruise.region} · ${cruise.duration}. ${cruise.description}`.slice(0, 200);
  return {
    title: `${cruise.name} — Voyages & Co.`,
    description: desc,
    openGraph: { title: cruise.name, description: desc, images: [cruise.image], type: "website" },
  };
}

export default async function CruiseDetailPage({ params }: { params: { id: string } }) {
  const cruise = await prisma.cruise.findUnique({ where: { id: params.id } });
  if (!cruise || !cruise.published) notFound();

  const reviews = await prisma.review.findMany({
    where: { type: "cruise", itemId: cruise.id, status: "approved" },
    orderBy: { createdAt: "desc" },
    select: { id: true, authorName: true, rating: true, comment: true, createdAt: true, images: true },
  });

  const nights = parseInt(cruise.duration, 10) || 7;
  const stops = [cruise.departurePort, ...cruise.ports];
  const faqs = (cruise.faqs as { q: string; a: string }[] | null) ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
      <RecordView type="cruise" id={cruise.id} title={cruise.name} image={cruise.image} href={`/cruises/${cruise.id}`} />
      <JsonLd data={[productJsonLd({ type: "cruise", id: cruise.id, basePath: "/cruises", name: cruise.name, description: cruise.description, image: cruise.image, price: cruise.pricePerPerson, priceOnRequest: cruise.priceOnRequest, rating: cruise.rating, reviewCount: cruise.reviewCount }, reviews), breadcrumbJsonLd([{ name: "Cruises", path: "/cruises" }, { name: cruise.name, path: `/cruises/${cruise.id}` }]), ...(faqs.length ? [faqJsonLd(faqs)] : [])]} />
      <div className="flex items-center justify-between mb-6">
        <Link href="/cruises" className="inline-flex items-center gap-2 text-xs tracking-[0.1em] uppercase text-ink-muted hover:text-gold transition-colors">
          <ArrowLeft size={15} /> <T k="detail.allVoyages" />
        </Link>
        <div className="flex items-center gap-4">
          <CompareButton type="cruise" id={cruise.id} title={cruise.name} image={cruise.image} href={`/cruises/${cruise.id}`} label
            attrs={{ Price: cruise.priceOnRequest ? "On request" : `₹${cruise.pricePerPerson.toLocaleString("en-IN")} pp`, Duration: cruise.duration, "Cruise line": cruise.cruiseLine, Region: cruise.region, Rating: `${cruise.rating} (${cruise.reviewCount})` }} />
          <SaveButton type="cruise" itemId={cruise.id} itemTitle={cruise.name} image={cruise.image} href={`/cruises/${cruise.id}`} label />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left — main content */}
        <div className="lg:col-span-2">
          {/* Hero image */}
          <div className="relative rounded-2xl overflow-hidden aspect-[16/9] mb-6">
            <Image src={cruise.image} alt={cruise.name} fill sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-vc-950/40 to-transparent" />
            {cruise.badge && (
              <span className="absolute top-4 left-4 text-[9px] font-medium tracking-[0.15em] uppercase text-gold border border-gold/50 bg-vc-950/70 backdrop-blur-sm px-3 py-1 rounded-sm">
                {cruise.badge}
              </span>
            )}
            <span className="absolute top-4 right-4 flex items-center gap-1 border border-gold/40 text-gold px-2.5 py-1 rounded-sm bg-vc-950/60 backdrop-blur-sm">
              <span className="text-sm font-medium">{cruise.rating}</span>
              <Star size={12} className="fill-gold text-gold" />
            </span>
          </div>

          {/* Title */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-ink-muted mb-2 font-light">
              <MapPin size={14} className="text-gold" />
              {cruise.departurePort} · {cruise.region}
            </div>
            <p className="text-[11px] tracking-[0.18em] uppercase text-gold mb-1">{cruise.cruiseLine} · {cruise.ship}</p>
            <h1 className="font-serif text-3xl sm:text-4xl font-light text-ink mb-3">{cruise.name}</h1>
            <p className="text-sm text-ink-muted font-light leading-relaxed mb-3">{cruise.description}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-ink-muted font-light">
              <span className="flex items-center gap-1.5"><Clock size={14} className="text-gold" /> {cruise.duration}</span>
              <span className="flex items-center gap-1.5"><Anchor size={14} className="text-gold" /> {cruise.ports.length} <T k="detail.portsOfCall" /></span>
              <span>{cruise.reviewCount.toLocaleString()} <T k="detail.reviews" /></span>
            </div>
          </div>

          {/* Highlights */}
          <div className="bg-panel rounded-2xl border border-line shadow-card p-6 mb-5">
            <h2 className="font-serif text-xl font-light text-ink mb-4"><T k="detail.highlights" /></h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {cruise.highlights.map(h => (
                <div key={h} className="flex items-center gap-2 text-sm text-ink-muted font-light">
                  <span className="w-5 h-5 rounded-full border border-gold/30 bg-gold/5 text-gold flex items-center justify-center shrink-0 text-[10px]">★</span>
                  {h}
                </div>
              ))}
            </div>
          </div>

          {/* Inclusions */}
          <div className="bg-panel rounded-2xl border border-line shadow-card p-6 mb-5">
            <h2 className="font-serif text-xl font-light text-ink mb-4"><T k="detail.whatsIncluded" /></h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {cruise.includes.map(inc => (
                <div key={inc} className="flex items-center gap-2 text-sm text-ink-muted font-light">
                  <CheckCircle size={15} className="text-gold shrink-0" />
                  {inc}
                </div>
              ))}
            </div>
          </div>

          {/* Onboard amenities */}
          <div className="bg-panel rounded-2xl border border-line shadow-card p-6 mb-5">
            <h2 className="font-serif text-xl font-light text-ink mb-4"><T k="detail.onboardAmenities" /></h2>
            <div className="flex flex-wrap gap-2">
              {cruise.amenities.map(a => (
                <span key={a} className="text-xs text-ink-muted bg-panel-soft border border-line px-3 py-1.5 rounded-full font-light">{a}</span>
              ))}
            </div>
          </div>

          {/* Itinerary by port */}
          <div className="bg-panel rounded-2xl border border-line shadow-card p-6">
            <h2 className="font-serif text-xl font-light text-ink mb-5"><T k="detail.voyageItinerary" /></h2>
            <div className="space-y-4">
              {stops.map((port, i) => (
                <div key={port} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full border border-gold/40 text-gold text-xs font-medium flex items-center justify-center shrink-0">
                      {i === 0 ? <Anchor size={13} /> : i + 1}
                    </div>
                    {i < stops.length - 1 && <div className="w-px flex-1 bg-line mt-1" />}
                  </div>
                  <div className="pb-4">
                    <p className="font-medium text-ink text-sm">
                      {i === 0 ? <><T k="detail.embarkation" /> — </> : <><T k="detail.day" /> {i * Math.max(1, Math.round(nights / stops.length))} — </>}{port}
                    </p>
                    <p className="text-xs text-ink-muted mt-1 font-light leading-relaxed">
                      {i === 0
                        ? <T k="detail.itineraryFirst" />
                        : i === stops.length - 1
                          ? <T k="detail.itineraryLast" />
                          : <T k="detail.itineraryMiddle" />}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — booking card */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-28 bg-panel rounded-2xl border border-line shadow-widget p-6">
            <div className="mb-5">
              {cruise.priceOnRequest ? (
                <p className="font-serif text-2xl font-light text-ink"><T k="detail.priceOnRequest" /></p>
              ) : (
                <>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-ink-faint font-light"><T k="card.perPersonFrom" /></p>
                  <Price amount={cruise.pricePerPerson} className="font-serif text-3xl font-light text-ink" />
                  <p className="text-xs text-ink-faint mt-1 font-light"><T k="detail.portFeesTaxes" /></p>
                </>
              )}
            </div>

            <div className="space-y-2.5 mb-5">
              {[
                { tKey: "detail.cruiseLine", value: cruise.cruiseLine },
                { tKey: "detail.ship", value: cruise.ship },
                { tKey: "card.duration", value: cruise.duration },
                { tKey: "detail.departs", value: cruise.departurePort },
                { tKey: "detail.style", value: cruise.category },
              ].map(r => (
                <div key={r.tKey} className="flex justify-between text-sm">
                  <span className="text-ink-muted font-light"><T k={r.tKey} /></span>
                  <span className="font-medium text-ink capitalize">{r.value}</span>
                </div>
              ))}
            </div>

            <Link href={cruise.priceOnRequest ? "/contact" : `/book?type=cruise&id=${cruise.id}`} className="block w-full text-center py-3.5 bg-ink hover:bg-ink/90 text-page font-normal text-xs tracking-[0.14em] uppercase rounded-sm transition-colors mb-3">
              <T k={cruise.priceOnRequest ? "detail.enquireNow" : "detail.reserveThisVoyage"} />
            </Link>
            <Link href="/contact" className="block w-full text-center py-3 border border-line-strong text-ink font-normal text-xs tracking-[0.14em] uppercase rounded-sm hover:bg-ink hover:text-page transition-all">
              <T k="detail.speakToCruiseSpecialist" />
            </Link>

            <div className="mt-5 pt-5 border-t border-line flex items-center gap-2 text-xs text-ink-muted font-light">
              <Phone size={13} className="text-gold" />
              <Link href="/contact" className="text-gold hover:underline"><T k="detail.speakToConcierge" /></Link>
            </div>
          </div>
        </div>
      </div>

      <FaqAndEntry faqs={faqs} entryRequirements={cruise.entryRequirements} />

      <ReviewsSection type="cruise" itemId={cruise.id} reviews={reviews} />
    </div>
  );
}
