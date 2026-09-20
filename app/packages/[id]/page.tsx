import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone } from "lucide-react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Price from "@/components/ui/Price";
import T from "@/components/ui/T";
import PackageStory from "@/components/packages/PackageStory";
import ReviewsSection from "@/components/reviews/ReviewsSection";
import PackageCard from "@/components/cards/PackageCard";
import SaveButton from "@/components/ui/SaveButton";
import ShareButton from "@/components/ui/ShareButton";
import JsonLd from "@/components/seo/JsonLd";
import FaqAndEntry from "@/components/products/FaqAndEntry";
import DestinationCompanion from "@/components/products/DestinationCompanion";
import { getPackageDestinationCoords } from "@/lib/package-destinations";
import { countryForPlace } from "@/lib/place-country";
import { resolveCoords } from "@/lib/place-coords";
import CompareButton from "@/components/compare/CompareButton";
import RecordView from "@/components/products/RecordView";
import AddToItineraryButton from "@/components/itinerary/AddToItineraryButton";
import DownloadPdfButton from "@/components/account/DownloadPdfButton";
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
    select: { id: true, authorName: true, rating: true, comment: true, createdAt: true, images: true },
  });

  const days = parseInt(pkg.duration, 10) || 7;
  const faqs = (pkg.faqs as { q: string; a: string }[] | null) ?? [];

  // "You may also like" — other journeys in the same category.
  const alsoLike = await prisma.package.findMany({
    where: { published: true, id: { not: pkg.id }, category: pkg.category },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
      <RecordView type="package" id={pkg.id} title={pkg.title} image={pkg.image} href={`/packages/${pkg.id}`} price={pkg.priceOnRequest ? undefined : pkg.pricePerPerson} />
      <JsonLd data={[productJsonLd({ type: "package", id: pkg.id, basePath: "/packages", name: pkg.title, description: pkg.subtitle, image: pkg.image, price: pkg.pricePerPerson, priceOnRequest: pkg.priceOnRequest }, reviews), breadcrumbJsonLd([{ name: "Destinations", path: "/packages" }, { name: pkg.title, path: `/packages/${pkg.id}` }]), ...(faqs.length ? [faqJsonLd(faqs)] : [])]} />
      <div className="flex items-center justify-between mb-6">
        <Link href="/packages" className="inline-flex items-center gap-2 text-xs tracking-[0.1em] uppercase text-ink-muted hover:text-gold transition-colors">
          <ArrowLeft size={15} /> <T k="detail.allJourneys" />
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1">
          <AddToItineraryButton type="package" id={pkg.id} title={pkg.title} image={pkg.image} href={`/packages/${pkg.id}`} price={pkg.priceOnRequest ? undefined : pkg.pricePerPerson} label />
          <CompareButton type="package" id={pkg.id} title={pkg.title} image={pkg.image} href={`/packages/${pkg.id}`} label
            attrs={{ Price: pkg.priceOnRequest ? "On request" : `₹${pkg.pricePerPerson.toLocaleString("en-IN")} pp`, Duration: pkg.duration, Destinations: String(pkg.destinations.length), Category: pkg.category }} />
          <SaveButton type="package" itemId={pkg.id} itemTitle={pkg.title} image={pkg.image} href={`/packages/${pkg.id}`} label />
          <ShareButton title={pkg.title} text={pkg.subtitle || pkg.title} path={`/packages/${pkg.id}`} label />
          <DownloadPdfButton
            label="Itinerary PDF"
            compact
            data={{
              filename: `${pkg.title.replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")}-itinerary.pdf`,
              subtitle: "Journey Dossier",
              image: pkg.image,
              headingLabel: pkg.subtitle,
              heading: pkg.title,
              intro: `${pkg.duration} · ${pkg.destinations.join(", ")}`,
              rows: [
                { label: "Duration", value: pkg.duration },
                { label: "Destinations", value: pkg.destinations.join(", ") },
                { label: "Category", value: pkg.category },
                { label: "Price", value: pkg.priceOnRequest ? "On request" : `From INR ${pkg.pricePerPerson.toLocaleString("en-IN")} per person` },
              ],
              paragraphs: [
                pkg.highlights.length ? `Highlights: ${pkg.highlights.join(" · ")}` : "",
                pkg.includes.length ? `What's included: ${pkg.includes.join(" · ")}` : "",
              ].filter(Boolean),
              footer: "An illustrative itinerary — your concierge will confirm exact daily arrangements ahead of departure.",
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left — main content */}
        <div className="lg:col-span-2">
          <PackageStory
            image={pkg.image}
            badge={pkg.badge}
            title={pkg.title}
            subtitle={pkg.subtitle}
            destinations={pkg.destinations}
            duration={pkg.duration}
            highlights={pkg.highlights}
            includes={pkg.includes}
            days={days}
          />
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

      {pkg.destinations[0] && (
        <DestinationCompanion
          coords={getPackageDestinationCoords(pkg.destinations[0]) ?? resolveCoords(pkg.destinations[0])}
          country={countryForPlace(pkg.destinations[0])}
          city={pkg.destinations[0]} name={pkg.destinations[0]} destKey={pkg.id}
          heading={`Your first stop · ${pkg.destinations[0]}`}
        />
      )}

      <FaqAndEntry faqs={faqs} entryRequirements={pkg.entryRequirements} />

      <ReviewsSection type="package" itemId={pkg.id} reviews={reviews} />

      {alsoLike.length > 0 && (
        <section className="mt-16 border-t border-line pt-10">
          <h2 className="font-serif text-2xl font-light text-ink mb-6"><T k="detail.youMayAlsoLike" /></h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {alsoLike.map(p => <PackageCard key={p.id} pkg={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
