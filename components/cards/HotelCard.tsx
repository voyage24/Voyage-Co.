"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, CheckCircle } from "lucide-react";
import type { Hotel } from "@/lib/types";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";

// `vertical` renders a stacked card (image on top) for multi-column grids;
// the default horizontal layout suits a full-width single-column list.
export default function HotelCard({ hotel, priority, vertical }: { hotel: Hotel; priority?: boolean; vertical?: boolean }) {
  const { format } = useCurrency();
  const { t } = useLanguage();
  return (
    <div className={`bg-panel rounded-2xl border border-line hover:border-gold/40 shadow-card hover:shadow-card-hover hover:-translate-y-1.5 transition-all duration-500 overflow-hidden flex flex-col group ${vertical ? "" : "sm:flex-row"}`}>
      {/* Image */}
      <div className={`relative overflow-hidden aspect-[4/3] ${vertical ? "" : "sm:w-60 shrink-0 sm:aspect-auto"}`}>
        <Image
          src={hotel.image}
          alt={hotel.name}
          fill
          priority={priority}
          sizes={vertical ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" : "(max-width: 640px) 100vw, 240px"}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {hotel.badge && (
          <span className="absolute top-3 left-3 text-[9px] font-medium tracking-[0.15em] uppercase text-gold border border-gold/50 bg-vc-950/70 backdrop-blur-sm px-2.5 py-1 rounded-sm">
            {hotel.badge}
          </span>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 p-5 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-0.5 mb-1.5">
              {Array.from({ length: hotel.stars }).map((_, i) => (
                <Star key={i} size={11} className="text-gold fill-gold" />
              ))}
              <span className="ml-2 text-[10px] tracking-[0.12em] uppercase text-ink-faint">{hotel.category}</span>
            </div>
            <Link href={`/hotels/${hotel.id}`}>
              <h3 className="font-serif text-xl font-light text-ink leading-tight hover:text-gold transition-colors">{hotel.name}</h3>
            </Link>
            <p className="text-xs text-ink-faint flex items-center gap-1 mt-1 font-light">
              <MapPin size={11} className="text-gold" /> {hotel.location}
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-1.5 border border-gold/40 text-gold px-2.5 py-1 rounded-sm">
            <span className="text-sm font-medium">{hotel.rating}</span>
            <Star size={11} className="fill-gold text-gold" />
          </div>
        </div>

        <p className="text-[11px] text-ink-faint mt-0.5 font-light">{hotel.reviewCount.toLocaleString()} {t("card.memberReviews")}</p>

        <p className="text-xs text-ink-muted font-light mt-3 leading-relaxed line-clamp-2">{hotel.description}</p>

        {/* Highlights */}
        <ul className="mt-3 space-y-1.5">
          {hotel.highlights.slice(0, 2).map(h => (
            <li key={h} className="flex items-center gap-2 text-xs text-ink-muted font-light">
              <CheckCircle size={11} className="text-gold shrink-0" />
              {h}
            </li>
          ))}
        </ul>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {hotel.amenities.slice(0, 5).map(a => (
            <span key={a} className="text-[11px] text-ink-muted bg-panel-soft border border-line px-2.5 py-0.5 rounded-full font-light">
              {a}
            </span>
          ))}
        </div>

        {/* Price & CTA */}
        <div className="mt-auto pt-4 flex items-end justify-between border-t border-line">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-serif text-2xl font-light text-ink">{format(hotel.pricePerNight)}</p>
              {hotel.valueBand === "value" && (
                <span className="text-[9px] font-medium tracking-[0.12em] uppercase text-emerald-600 border border-emerald-600/40 bg-emerald-500/5 px-1.5 py-0.5 rounded-sm">
                  Great value
                </span>
              )}
            </div>
            <p className="text-[11px] text-ink-faint font-light">{t("card.perNightTaxes")}</p>
          </div>
          <Link href={`/hotels/${hotel.id}`} className="px-6 py-2.5 border border-line-strong text-ink hover:bg-ink hover:text-page text-xs font-normal tracking-[0.12em] uppercase rounded-sm transition-all duration-300">
            {t("card.viewSuite")}
          </Link>
        </div>
      </div>
    </div>
  );
}
