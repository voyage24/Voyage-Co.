"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Flight } from "@/lib/types";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import RouteMap from "@/components/cards/RouteMap";

export default function FlightCard({ flight }: { flight: Flight }) {
  const [expanded, setExpanded] = useState(false);
  const { format } = useCurrency();
  const { t } = useLanguage();
  const idNum = parseInt(flight.id.replace(/\D/g, ""), 10) || 0;
  const discount = 5 + (idNum % 10);
  const isLive = flight.source === "live";

  return (
    <div className="bg-panel rounded-2xl border border-line hover:border-gold/40 shadow-card hover:shadow-card-hover transition-all duration-500 overflow-hidden">
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Airline */}
          <div className="flex items-center gap-3 sm:w-36">
            <div className="w-10 h-10 rounded-sm border border-gold/40 text-gold flex items-center justify-center text-xs font-medium tracking-wide">
              {flight.airlineCode}
            </div>
            <div>
              <p className="text-sm font-medium text-ink">{flight.airline}</p>
              <p className="text-xs text-ink-faint font-light">{flight.flightNumber}</p>
            </div>
          </div>

          {/* Route */}
          <div className="flex-1 flex items-center gap-4">
            <div className="text-right sm:text-left">
              <p className="font-serif text-xl font-light text-ink">{flight.departure}</p>
              <p className="text-sm text-ink-muted font-light">{flight.originCity}</p>
              <p className="text-[11px] text-ink-faint font-light">{flight.origin}</p>
            </div>

            <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
              <p className="text-xs text-ink-faint font-light">{flight.duration}</p>
              <div className="relative w-full flex items-center">
                <div className="h-px bg-line flex-1" />
                <div className="absolute left-1/2 -translate-x-1/2 bg-panel px-1">
                  {flight.stops === 0 ? (
                    <span className="text-[10px] text-gold font-medium tracking-wide">{t("card.nonStop")}</span>
                  ) : (
                    <span className="text-[10px] text-ink-muted font-medium tracking-wide">{flight.stops} {t("card.stop")}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-left">
              <p className="font-serif text-xl font-light text-ink">{flight.arrival}</p>
              <p className="text-sm text-ink-muted font-light">{flight.destinationCity}</p>
              <p className="text-[11px] text-ink-faint font-light">{flight.destination}</p>
            </div>
          </div>

          {/* Price */}
          <div className="sm:text-right sm:ml-4 flex sm:flex-col items-center sm:items-end justify-between">
            <div>
              {!isLive && (
                <p className="text-xs text-ink-faint line-through font-light">{format(flight.price * (1 + discount / 100))}</p>
              )}
              <p className="font-serif text-2xl font-light text-ink">{format(flight.price)}</p>
              {isLive ? (
                <p className="text-[11px] text-gold font-medium">{t("card.liveFare")}</p>
              ) : (
                <p className="text-[11px] text-gold font-medium">{discount}{t("card.percentOff")}</p>
              )}
              {flight.businessPrice && (
                <p className="text-[10px] text-ink-faint font-light mt-0.5">{t("card.business")} {format(flight.businessPrice)}</p>
              )}
            </div>
            <Link href={`/book?type=flight&id=${flight.id}`} className="sm:mt-3 inline-block px-6 py-2.5 border border-line-strong text-ink hover:bg-ink hover:text-page text-xs font-normal tracking-[0.12em] uppercase rounded-sm transition-all duration-300">
              {t("card.reserve")}
            </Link>
          </div>
        </div>

        {/* Tags row */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-line">
          {flight.amenities.slice(0, 4).map(a => (
            <span key={a} className="text-[10px] text-ink-muted bg-panel-soft px-2.5 py-0.5 rounded-full font-light">{a}</span>
          ))}
          <button
            onClick={() => setExpanded(!expanded)}
            className="ml-auto flex items-center gap-1 text-xs text-gold hover:underline"
          >
            {expanded ? t("card.less") : t("card.details")}
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="bg-panel-soft border-t border-line text-sm">
          <RouteMap originCode={flight.origin} destinationCode={flight.destination} />
          <div className="px-5 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                [t("card.airline"), `${flight.airline} (${flight.airlineCode})`],
                [t("card.route"), `${flight.origin} → ${flight.destination}`],
                [t("card.duration"), flight.duration],
              ].map(([label, val]) => (
                <div key={label}>
                  <p className="text-xs text-ink-faint mb-1 font-light">{label}</p>
                  <p className="font-medium text-ink text-sm">{val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
