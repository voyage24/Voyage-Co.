"use client";

import Link from "next/link";
import type { Train } from "@/lib/types";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function TrainCard({ train }: { train: Train }) {
  const { format } = useCurrency();
  const { t } = useLanguage();
  return (
    <div className="bg-panel rounded-2xl border border-line hover:border-gold/40 shadow-card hover:shadow-card-hover transition-all duration-500 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Train info */}
        <div className="sm:w-52">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-gold" />
            <p className="text-sm font-medium text-ink">{train.name}</p>
          </div>
          <p className="text-xs text-ink-faint mt-0.5 ml-4 font-light">#{train.number}</p>
          <div className="flex gap-1 mt-2 ml-4 flex-wrap">
            {train.runsDays.map(d => (
              <span key={d} className="text-[10px] font-medium px-1.5 py-0.5 rounded-sm border border-gold/30 bg-gold/5 text-gold">{d}</span>
            ))}
          </div>
        </div>

        {/* Route */}
        <div className="flex-1 flex items-center gap-4">
          <div>
            <p className="font-serif text-xl font-light text-ink">{train.departure}</p>
            <p className="text-sm text-ink-muted font-light">{train.originCity}</p>
            <p className="text-[11px] text-ink-faint font-light">{train.origin}</p>
          </div>
          <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
            <p className="text-xs text-ink-faint font-light">{train.duration}</p>
            <div className="w-full flex items-center gap-1">
              <div className="w-2 h-2 rounded-full border-2 border-gold bg-panel shrink-0" />
              <div className="h-px flex-1 bg-line" />
              <div className="w-2 h-2 rounded-full bg-gold shrink-0" />
            </div>
          </div>
          <div className="text-right">
            <p className="font-serif text-xl font-light text-ink">{train.arrival}</p>
            <p className="text-sm text-ink-muted font-light">{train.destinationCity}</p>
            <p className="text-[11px] text-ink-faint font-light">{train.destination}</p>
          </div>
        </div>

        {/* Classes */}
        <div className="sm:w-64">
          <p className="text-[11px] tracking-[0.12em] uppercase text-ink-faint mb-2">{t("card.availableClasses")}</p>
          <div className="flex flex-wrap gap-2">
            {train.classes.map(cls => (
              <Link
                key={cls.type}
                href={`/book?type=train&id=${train.id}`}
                className="border border-line hover:border-ink rounded-sm px-3 py-2 text-center transition-colors group"
              >
                <p className="text-xs font-medium text-ink-muted group-hover:text-ink">{cls.type}</p>
                <p className="font-serif text-base font-light text-ink">{format(cls.price)}</p>
                <p className="text-[10px] text-ink-faint font-light">{cls.available} {t("card.avail")}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
