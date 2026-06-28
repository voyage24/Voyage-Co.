import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, CheckCircle, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Price from "@/components/ui/Price";
import T from "@/components/ui/T";
import ReviewsSection from "@/components/reviews/ReviewsSection";
import SaveButton from "@/components/ui/SaveButton";

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
    select: { id: true, authorName: true, rating: true, comment: true, createdAt: true },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <div className="flex items-center justify-between mb-6">
        <Link href="/experiences" className="inline-flex items-center gap-2 text-xs tracking-[0.1em] uppercase text-ink-muted hover:text-ink transition-colors">
          <ArrowLeft size={15} /> <T k="detail.allExperiences" />
        </Link>
        <SaveButton type="experience" itemId={exp.id} itemTitle={exp.title} image={exp.image} href={`/experiences/${exp.id}`} label />
      </div>

      {/* Hero image */}
      <div className="relative rounded-2xl overflow-hidden aspect-[16/8] mb-8">
        <Image src={exp.image} alt={exp.title} fill sizes="100vw" className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-vc-950/40 to-transparent" />
        {exp.badge && (
          <span className="absolute top-4 left-4 text-[10px] font-medium tracking-[0.15em] uppercase text-gold border border-gold/50 bg-vc-950/70 backdrop-blur-sm px-3 py-1 rounded-sm">
            {exp.badge}
          </span>
        )}
      </div>

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
              <Price amount={exp.price} className="font-serif text-3xl font-light text-ink" />
              <p className="text-xs text-ink-faint font-light"><T k="detail.perPerson" /></p>
            </div>
            <Link
              href={`/book?type=experience&id=${exp.id}`}
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

      <ReviewsSection type="experience" itemId={exp.id} reviews={reviews} />
    </div>
  );
}
