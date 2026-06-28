import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, CheckCircle, ArrowLeft, Phone, Users } from "lucide-react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Price from "@/components/ui/Price";
import T from "@/components/ui/T";
import ReviewsSection from "@/components/reviews/ReviewsSection";
import SaveButton from "@/components/ui/SaveButton";
import JsonLd from "@/components/seo/JsonLd";
import FaqAndEntry from "@/components/products/FaqAndEntry";
import { productJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const pkg = await prisma.package.findUnique({ where: { id: params.id } });
  if (!pkg) return { title: "Journey — Voyages & Co." };
  const desc = `${pkg.subtitle} · ${pkg.duration}. ${pkg.destinations.join(", ")}.`;
  return {
    title: `${pkg.title} — Voyages & Co.`,
    description: desc,
    openGraph: { title: pkg.title, description: desc, images: [pkg.image], type: "website" },
  };
}

export default async function PackageDetailPage({ params }: { params: { id: string } }) {
  const pkg = await prisma.package.findUnique({ where: { id: params.id } });
  if (!pkg || !pkg.published) notFound();

  const reviews = await prisma.review.findMany({
    where: { type: "package", itemId: pkg.id, status: "approved" },
    orderBy: { createdAt: "desc" },
    select: { id: true, authorName: true, rating: true, comment: true, createdAt: true },
  });

  const days = parseInt(pkg.duration, 10) || 7;
  const faqs = (pkg.faqs as { q: string; a: string }[] | null) ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
      <JsonLd data={[productJsonLd({ type: "package", id: pkg.id, basePath: "/packages", name: pkg.title, description: pkg.subtitle, image: pkg.image, price: pkg.pricePerPerson, priceOnRequest: pkg.priceOnRequest }, reviews), breadcrumbJsonLd([{ name: "Destinations", path: "/packages" }, { name: pkg.title, path: `/packages/${pkg.id}` }]), ...(faqs.length ? [faqJsonLd(faqs)] : [])]} />
      <div className="flex items-center justify-between mb-6">
        <Link href="/packages" className="inline-flex items-center gap-2 text-xs tracking-[0.1em] uppercase text-ink-muted hover:text-gold transition-colors">
          <ArrowLeft size={15} /> <T k="detail.allJourneys" />
        </Link>
        <SaveButton type="package" itemId={pkg.id} itemTitle={pkg.title} image={pkg.image} href={`/packages/${pkg.id}`} label />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left — main content */}
        <div className="lg:col-span-2">
          {/* Hero image */}
          <div className="relative rounded-2xl overflow-hidden aspect-[16/9] mb-6">
            <Image src={pkg.image} alt={pkg.title} fill sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-vc-950/40 to-transparent" />
            {pkg.badge && (
              <span className="absolute top-4 left-4 text-[9px] font-medium tracking-[0.15em] uppercase text-gold border border-gold/50 bg-vc-950/70 backdrop-blur-sm px-3 py-1 rounded-sm">
                {pkg.badge}
              </span>
            )}
          </div>

          {/* Title */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-ink-muted mb-2 font-light">
              <MapPin size={14} className="text-gold" />
              {pkg.destinations.join(" · ")}
            </div>
            <p className="text-[11px] tracking-[0.18em] uppercase text-gold mb-1">{pkg.subtitle}</p>
            <h1 className="font-serif text-3xl sm:text-4xl font-light text-ink mb-3">{pkg.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-ink-muted font-light">
              <span className="flex items-center gap-1.5"><Clock size={14} className="text-gold" /> {pkg.duration}</span>
              <span className="flex items-center gap-1.5"><Users size={14} className="text-gold" /> <T k="detail.privateTailored" /></span>
            </div>
          </div>

          {/* Highlights */}
          <div className="bg-panel rounded-2xl border border-line shadow-card p-6 mb-5">
            <h2 className="font-serif text-xl font-light text-ink mb-4"><T k="detail.highlights" /></h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pkg.highlights.map(h => (
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
              {pkg.includes.map(inc => (
                <div key={inc} className="flex items-center gap-2 text-sm text-ink-muted font-light">
                  <CheckCircle size={15} className="text-gold shrink-0" />
                  {inc}
                </div>
              ))}
            </div>
          </div>

          {/* Sample itinerary */}
          <div className="bg-panel rounded-2xl border border-line shadow-card p-6">
            <h2 className="font-serif text-xl font-light text-ink mb-5"><T k="detail.sampleItinerary" /></h2>
            <div className="space-y-4">
              {Array.from({ length: Math.min(days, 8) }, (_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full border border-gold/40 text-gold text-xs font-medium flex items-center justify-center shrink-0">
                      {i + 1}
                    </div>
                    {i < Math.min(days, 8) - 1 && <div className="w-px flex-1 bg-line mt-1" />}
                  </div>
                  <div className="pb-4">
                    <p className="font-medium text-ink text-sm"><T k="detail.day" /> {i + 1} — {pkg.destinations[i % pkg.destinations.length]}</p>
                    <p className="text-xs text-ink-muted mt-1 font-light leading-relaxed">
                      {i === 0
                        ? <T k="detail.packageItineraryFirst" />
                        : i === Math.min(days, 8) - 1
                          ? <T k="detail.packageItineraryLast" />
                          : <T k="detail.packageItineraryMiddle" />}
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
              {pkg.priceOnRequest ? (
                <p className="font-serif text-2xl font-light text-ink"><T k="detail.priceOnRequest" /></p>
              ) : (
                <>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-ink-faint font-light"><T k="card.perPersonFrom" /></p>
                  <Price amount={pkg.pricePerPerson} className="font-serif text-3xl font-light text-ink" />
                  <p className="text-xs text-ink-faint mt-1 font-light"><T k="detail.taxesFees" /></p>
                </>
              )}
            </div>

            <div className="space-y-2.5 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-ink-muted font-light"><T k="card.duration" /></span>
                <span className="font-medium text-ink">{pkg.duration}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-muted font-light"><T k="detail.destinations" /></span>
                <span className="font-medium text-ink">{pkg.destinations.length} <T k={pkg.destinations.length === 1 ? "detail.city" : "detail.cities"} /></span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-muted font-light"><T k="experienceSearch.category" /></span>
                <span className="font-medium text-ink">{pkg.category}</span>
              </div>
            </div>

            <Link href={pkg.priceOnRequest ? "/contact" : `/book?type=package&id=${pkg.id}`} className="block w-full text-center py-3.5 bg-ink hover:bg-ink/90 text-page font-normal text-xs tracking-[0.14em] uppercase rounded-sm transition-colors mb-3">
              <T k={pkg.priceOnRequest ? "detail.enquireNow" : "detail.enquireToBook"} />
            </Link>
            <Link href="/contact" className="block w-full text-center py-3 border border-line-strong text-ink font-normal text-xs tracking-[0.14em] uppercase rounded-sm hover:bg-ink hover:text-page transition-all">
              <T k="detail.customiseJourney" />
            </Link>

            <div className="mt-5 pt-5 border-t border-line flex items-center gap-2 text-xs text-ink-muted font-light">
              <Phone size={13} className="text-gold" />
              <Link href="/contact" className="text-gold hover:underline"><T k="detail.speakToConcierge" /></Link>
            </div>
          </div>
        </div>
      </div>

      <FaqAndEntry faqs={faqs} entryRequirements={pkg.entryRequirements} />

      <ReviewsSection type="package" itemId={pkg.id} reviews={reviews} />
    </div>
  );
}
