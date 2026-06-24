"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/components/providers/LanguageProvider";

const DESTINATIONS = [
  {
    name: "Santorini",
    country: "Greece",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&h=800&fit=crop&q=85",
    tag: "Island Escape",
    href: "/hotels",
  },
  {
    name: "Bhutan",
    country: "Kingdom of Thunder Dragon",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&h=800&fit=crop&q=85",
    tag: "Spiritual Journey",
    href: "/hotels",
  },
  {
    name: "Maldives",
    country: "Indian Ocean",
    image: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=600&h=800&fit=crop&q=85",
    tag: "Overwater Villas",
    href: "/hotels",
  },
  {
    name: "Kyoto",
    country: "Japan",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&h=800&fit=crop&q=85",
    tag: "Cultural Immersion",
    href: "/hotels",
  },
  {
    name: "Amalfi Coast",
    country: "Italy",
    image: "https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=600&h=800&fit=crop&q=85",
    tag: "Mediterranean Bliss",
    href: "/hotels",
  },
  {
    name: "Bali",
    country: "Indonesia",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&h=800&fit=crop&q=85",
    tag: "Wellness Retreat",
    href: "/hotels",
  },
];

export default function PopularDestinations() {
  const { t } = useLanguage();
  return (
    <section className="bg-page py-24 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">

        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 gap-4">
          <div>
            <p className="text-[10px] font-medium tracking-[0.3em] uppercase text-gold mb-3">
              {t("popularDest.eyebrow")}
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl font-light text-ink leading-tight">
              {t("popularDest.headlinePre")}<br />
              <em className="not-italic text-gold">{t("popularDest.headlineEm")}</em> {t("popularDest.headlineSuffix")}
            </h2>
          </div>
          <Link
            href="/packages"
            className="text-xs tracking-[0.18em] uppercase text-gold link-underline self-start sm:self-auto whitespace-nowrap"
          >
            {t("popularDest.viewAll")}
          </Link>
        </div>

        {/* Destination grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {DESTINATIONS.map((dest, i) => (
            <Link
              key={dest.name}
              href={dest.href}
              className={`group relative overflow-hidden rounded-xl cursor-pointer ${
                i === 0 || i === 3 ? "sm:col-span-2 row-span-1" : ""
              }`}
              style={{ aspectRatio: i === 0 || i === 3 ? "16/10" : "3/4" }}
            >
              <Image
                src={dest.image}
                alt={dest.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Overlay — always dark over photos */}
              <div className="absolute inset-0 bg-gradient-to-t from-vc-950/85 via-vc-950/20 to-transparent" />
              {/* Gold border on hover */}
              <div className="absolute inset-0 border border-transparent group-hover:border-gold/50 rounded-xl transition-colors duration-500" />
              {/* Text */}
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-[9px] font-medium tracking-[0.2em] uppercase text-gold mb-1">{dest.tag}</p>
                <p className="text-[#f2efe9] font-serif text-lg font-light leading-tight">{dest.name}</p>
                <p className="text-[#cdc4b5] text-[11px] mt-0.5 font-light">{dest.country}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
