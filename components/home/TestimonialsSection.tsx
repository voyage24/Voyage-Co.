"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import type { Testimonial } from "@/lib/types";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  const { t } = useLanguage();
  if (!testimonials.length) return null;

  return (
    <section className="bg-page py-24 px-6 lg:px-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[10px] font-medium tracking-[0.3em] uppercase text-gold mb-3">{t("testimonials.eyebrow")}</p>
          <h2 className="font-serif text-4xl sm:text-5xl font-light text-ink leading-tight">{t("testimonials.heading")}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.slice(0, 6).map(tm => (
            <figure key={tm.id} className="bg-panel border border-line rounded-2xl shadow-card p-7 flex flex-col">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: Math.max(1, Math.min(5, tm.rating)) }).map((_, i) => (
                  <Star key={i} size={14} className="text-gold fill-gold" />
                ))}
              </div>
              <blockquote className="text-ink-muted font-light leading-relaxed italic flex-1">&ldquo;{tm.quote}&rdquo;</blockquote>
              <figcaption className="flex items-center gap-3 mt-6 pt-5 border-t border-line">
                {tm.image && (
                  <span className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-line">
                    <Image src={tm.image} alt={tm.author} fill sizes="40px" className="object-cover" />
                  </span>
                )}
                <span>
                  <span className="block text-sm font-medium text-ink">{tm.author}</span>
                  {tm.detail && <span className="block text-xs text-ink-faint font-light">{tm.detail}</span>}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
