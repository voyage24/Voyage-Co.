"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock } from "lucide-react";
import type { Package } from "@/lib/types";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function PackagesPreview({ packages }: { packages: Package[] }) {
  const { format } = useCurrency();
  const { t } = useLanguage();
  const featured = packages.slice(0, 3);

  return (
    <section className="bg-page py-24 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 gap-4">
          <div>
            <p className="text-[10px] font-medium tracking-[0.3em] uppercase text-gold mb-3">
              {t("packagesPreview.eyebrow")}
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl font-light text-ink leading-tight">
              {t("packagesPreview.headlinePre")}<br />
              <em className="not-italic text-gold">{t("packagesPreview.headlineEm")}</em>
            </h2>
          </div>
          <Link
            href="/packages"
            className="text-xs tracking-[0.18em] uppercase text-gold hover:underline self-start sm:self-auto whitespace-nowrap"
          >
            {t("packagesPreview.viewAll")}
          </Link>
        </div>

        {/* Package cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featured.map(pkg => (
            <Link
              key={pkg.id}
              href={`/packages/${pkg.id}`}
              className="group flex flex-col rounded-2xl overflow-hidden bg-panel border border-line hover:border-gold/40 transition-all duration-500 shadow-card hover:shadow-card-hover"
            >
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden shrink-0">
                <Image
                  src={pkg.image}
                  alt={pkg.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {pkg.badge && (
                  <span className="absolute top-4 left-4 text-[9px] font-medium tracking-[0.2em] uppercase text-gold border border-gold/40 px-3 py-1 rounded-sm bg-vc-950/70 backdrop-blur-sm">
                    {pkg.badge}
                  </span>
                )}
              </div>

              {/* Content — flex column so the price/CTA row always sticks to
                  the bottom, regardless of how many lines the translated
                  destinations/title text wraps to. */}
              <div className="p-6 flex flex-col flex-1">
                <p className="text-[10px] tracking-[0.16em] uppercase text-gold mb-1 font-light">{pkg.subtitle}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-ink-muted mb-2 font-light">
                  <MapPin size={11} className="text-gold shrink-0" />
                  <span>{pkg.destinations.join(" · ")}</span>
                </div>

                <h3 className="font-serif text-xl font-light text-ink leading-snug mb-3 line-clamp-2">
                  {pkg.title}
                </h3>

                <div className="flex items-center gap-1.5 text-[11px] text-ink-muted mb-6 font-light">
                  <Clock size={11} className="text-gold shrink-0" />
                  <span>{pkg.duration}</span>
                </div>

                <div className="mt-auto flex items-end justify-between border-t border-line pt-5">
                  <div>
                    <p className="text-[10px] tracking-[0.1em] uppercase text-ink-faint mb-1 font-light">{t("packagesPreview.fromPerPerson")}</p>
                    <p className="font-serif text-2xl font-light text-ink">
                      {format(pkg.pricePerPerson)}
                    </p>
                  </div>
                  <span className="text-[10px] tracking-[0.15em] uppercase text-gold border-b border-gold/40 pb-0.5 group-hover:border-gold transition-colors">
                    {t("packagesPreview.enquire")}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
