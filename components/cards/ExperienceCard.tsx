"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, CheckCircle } from "lucide-react";
import type { Experience } from "@/lib/types";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function ExperienceCard({ exp, priority }: { exp: Experience; priority?: boolean }) {
  const { format } = useCurrency();
  const { t } = useLanguage();
  return (
    <div className="bg-panel rounded-2xl border border-line hover:border-gold/40 shadow-card hover:shadow-card-hover hover:-translate-y-1.5 transition-all duration-500 overflow-hidden group">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image src={exp.image} alt={exp.title} fill priority={priority} sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-vc-950/40 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="text-[9px] font-medium tracking-[0.15em] uppercase text-white/90 bg-vc-950/50 backdrop-blur-sm px-2.5 py-1 rounded-sm capitalize">
            {exp.category}
          </span>
          {exp.badge && (
            <span className="text-[9px] font-medium tracking-[0.15em] uppercase text-gold border border-gold/50 bg-vc-950/70 backdrop-blur-sm px-2.5 py-1 rounded-sm">
              {exp.badge}
            </span>
          )}
        </div>
      </div>
      <div className="p-5">
        <Link href={`/experiences/${exp.id}`}>
          <h3 className="font-serif text-lg font-light text-ink leading-snug mb-1 line-clamp-2 hover:text-gold transition-colors">{exp.title}</h3>
        </Link>
        <p className="text-xs text-ink-faint mb-2 font-light">{exp.location}</p>
        <p className="text-xs text-ink-muted font-light leading-relaxed mb-3 line-clamp-2">{exp.description}</p>
        <div className="flex items-center gap-3 text-xs text-ink-muted mb-4 font-light">
          <span className="flex items-center gap-1"><Clock size={11} className="text-gold" /> {exp.duration}</span>
        </div>
        <ul className="space-y-1.5 mb-4">
          {exp.includes.slice(0, 3).map(inc => (
            <li key={inc} className="flex items-center gap-2 text-xs text-ink-muted font-light">
              <CheckCircle size={11} className="text-gold shrink-0" />
              {inc}
            </li>
          ))}
        </ul>
        <div className="flex items-end justify-between pt-4 border-t border-line">
          <div>
            <p className="text-[10px] tracking-[0.1em] uppercase text-ink-faint font-light">{t("card.perPersonFrom")}</p>
            <p className="font-serif text-xl font-light text-ink">{format(exp.price)}</p>
          </div>
          <Link href={`/book?type=experience&id=${exp.id}`} className="px-5 py-2.5 border border-line-strong text-ink hover:bg-ink hover:text-page text-xs font-normal tracking-[0.12em] uppercase rounded-sm transition-all duration-300">
            {t("card.reserve")}
          </Link>
        </div>
      </div>
    </div>
  );
}
