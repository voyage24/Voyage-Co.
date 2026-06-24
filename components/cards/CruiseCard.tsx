"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, Anchor, Star, CheckCircle } from "lucide-react";
import type { Cruise } from "@/lib/types";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function CruiseCard({ cruise, priority }: { cruise: Cruise; priority?: boolean }) {
  const { format } = useCurrency();
  const { t } = useLanguage();
  return (
    <div className="bg-panel rounded-2xl border border-line hover:border-gold/40 shadow-card hover:shadow-card-hover transition-all duration-500 overflow-hidden group">
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image src={cruise.image} alt={cruise.name} fill priority={priority} sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-vc-950/60 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          {cruise.badge && (
            <span className="text-[9px] font-medium tracking-[0.15em] uppercase text-gold border border-gold/50 bg-vc-950/70 backdrop-blur-sm px-2.5 py-1 rounded-sm">{cruise.badge}</span>
          )}
          <span className="text-[9px] font-medium tracking-[0.15em] uppercase text-white/90 bg-vc-950/50 backdrop-blur-sm px-2.5 py-1 rounded-sm capitalize">{cruise.category}</span>
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1 border border-gold/40 text-gold px-2 py-0.5 rounded-sm bg-vc-950/50 backdrop-blur-sm">
          <span className="text-xs font-medium">{cruise.rating}</span>
          <Star size={10} className="fill-gold text-gold" />
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white/90 text-xs font-light">
          <MapPin size={12} className="text-gold" />
          {cruise.departurePort} → {cruise.ports.length} {cruise.ports.length !== 1 ? t("card.ports") : t("card.port")}
        </div>
      </div>

      <div className="p-5">
        <p className="text-[11px] tracking-[0.14em] uppercase text-gold mb-1 font-light">{cruise.cruiseLine} · {cruise.ship}</p>
        <Link href={`/cruises/${cruise.id}`}>
          <h3 className="font-serif text-lg font-light text-ink leading-snug mb-2 line-clamp-2 hover:text-gold transition-colors">{cruise.name}</h3>
        </Link>
        <div className="flex items-center gap-3 text-xs text-ink-muted mb-4 font-light">
          <span className="flex items-center gap-1"><Clock size={11} className="text-gold" /> {cruise.duration}</span>
          <span className="flex items-center gap-1"><Anchor size={11} className="text-gold" /> {cruise.region}</span>
        </div>

        <ul className="space-y-1.5 mb-5">
          {cruise.highlights.slice(0, 2).map(h => (
            <li key={h} className="flex items-center gap-2 text-xs text-ink-muted font-light">
              <CheckCircle size={11} className="text-gold shrink-0" />
              <span className="line-clamp-1">{h}</span>
            </li>
          ))}
        </ul>

        <div className="flex items-end justify-between pt-4 border-t border-line">
          <div>
            <p className="text-[10px] tracking-[0.1em] uppercase text-ink-faint font-light">{t("card.perPersonFrom")}</p>
            <p className="font-serif text-2xl font-light text-ink">{format(cruise.pricePerPerson)}</p>
          </div>
          <Link href={`/book?type=cruise&id=${cruise.id}`} className="px-5 py-2.5 border border-line-strong text-ink hover:bg-ink hover:text-page text-xs font-normal tracking-[0.12em] uppercase rounded-sm transition-all duration-300">
            {t("card.reserve")}
          </Link>
        </div>
      </div>
    </div>
  );
}
