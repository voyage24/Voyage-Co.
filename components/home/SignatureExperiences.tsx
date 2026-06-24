"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/components/providers/LanguageProvider";

const EXPERIENCES = [
  {
    key: "wellness",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&h=600&fit=crop&q=85",
    href: "/experiences",
    accent: "from-emerald-900/60 to-vc-950/85",
  },
  {
    key: "culture",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=600&fit=crop&q=85",
    href: "/experiences",
    accent: "from-stone-800/60 to-vc-950/85",
  },
  {
    key: "adventure",
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&h=600&fit=crop&q=85",
    href: "/experiences",
    accent: "from-blue-900/60 to-vc-950/85",
  },
];

export default function SignatureExperiences() {
  const { t } = useLanguage();
  return (
    <section className="bg-panel-soft py-24 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-[10px] font-medium tracking-[0.3em] uppercase text-gold mb-3">
            {t("sigExp.eyebrow")}
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl font-light text-ink leading-tight">
            {t("sigExp.heading")}
          </h2>
          <p className="text-ink-muted font-light mt-4 max-w-lg mx-auto text-sm leading-relaxed">
            {t("sigExp.subtext")}
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {EXPERIENCES.map(exp => (
            <Link
              key={exp.key}
              href={exp.href}
              className="group relative overflow-hidden rounded-2xl aspect-[4/5] cursor-pointer"
            >
              <Image
                src={exp.image}
                alt={t(`sigExp.${exp.key}.title`)}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${exp.accent}`} />
              <div className="absolute inset-0 border border-transparent group-hover:border-gold/40 rounded-2xl transition-colors duration-500" />

              <div className="absolute inset-x-0 bottom-0 p-7">
                <span className="inline-block text-[9px] font-medium tracking-[0.25em] uppercase text-gold border border-gold/40 px-3 py-1 rounded-sm mb-4 bg-gold/10 backdrop-blur-sm">
                  {t(`sigExp.${exp.key}.tag`)}
                </span>
                <h3 className="font-serif text-2xl font-light text-[#f2efe9] mb-3 leading-tight">
                  {t(`sigExp.${exp.key}.title`)}
                </h3>
                <p className="text-[#cdc4b5] text-sm font-light leading-relaxed mb-5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 max-h-0 group-hover:max-h-24 overflow-hidden">
                  {t(`sigExp.${exp.key}.description`)}
                </p>
                <span className="text-xs tracking-[0.18em] uppercase text-gold border-b border-gold/40 pb-0.5 group-hover:border-gold transition-colors">
                  {t(`sigExp.${exp.key}.cta`)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
