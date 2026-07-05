"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, Briefcase } from "lucide-react";
import { useTrips } from "@/components/providers/TripsProvider";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useContent } from "@/components/providers/ContentProvider";

export default function GuestTrips() {
  const { t } = useLanguage();
  const c = useContent();
  const { trips, removeTrip } = useTrips();
  const { format } = useCurrency();

  const fmtDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    } catch { return ""; }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
      <div className="text-center mb-12">
        <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-3">{c("trips.eyebrow") || t("trips.eyebrow")}</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-3">{c("trips.title") || t("trips.title")}</h1>
        <p className="text-ink-muted font-light">{c("trips.intro") || t("trips.subtitle")}</p>
      </div>

      {trips.length === 0 ? (
        <div className="bg-panel-soft border border-line rounded-2xl p-16 text-center">
          <div className="w-14 h-14 rounded-full border border-line flex items-center justify-center mx-auto mb-5">
            <Briefcase size={22} className="text-ink-faint" />
          </div>
          <h2 className="font-serif text-2xl font-light text-ink mb-2">{t("trips.noReservations")}</h2>
          <p className="text-ink-muted font-light mb-8 max-w-sm mx-auto">
            {t("trips.noReservationsDesc")}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/hotels" className="px-7 py-3.5 bg-ink text-page text-xs tracking-[0.16em] uppercase rounded-sm hover:bg-ink/90 transition-all duration-200 hover:scale-105 active:scale-95">
              {t("trips.browseStays")}
            </Link>
            <Link href="/flights" className="px-7 py-3.5 border border-line-strong text-ink text-xs tracking-[0.16em] uppercase rounded-sm hover:bg-ink hover:text-page transition-all duration-200 hover:scale-105 active:scale-95">
              {t("trips.findFlight")}
            </Link>
            <Link href="/cruises" className="px-7 py-3.5 border border-line-strong text-ink text-xs tracking-[0.16em] uppercase rounded-sm hover:bg-ink hover:text-page transition-all duration-200 hover:scale-105 active:scale-95">
              {t("trips.browseCruises")}
            </Link>
            <Link href="/packages" className="px-7 py-3.5 border border-line-strong text-ink text-xs tracking-[0.16em] uppercase rounded-sm hover:bg-ink hover:text-page transition-all duration-200 hover:scale-105 active:scale-95">
              {t("trips.browseDestinations")}
            </Link>
            <Link href="/experiences" className="px-7 py-3.5 border border-line-strong text-ink text-xs tracking-[0.16em] uppercase rounded-sm hover:bg-ink hover:text-page transition-all duration-200 hover:scale-105 active:scale-95">
              {t("trips.browseExperiences")}
            </Link>
            <Link href="/trains" className="px-7 py-3.5 border border-line-strong text-ink text-xs tracking-[0.16em] uppercase rounded-sm hover:bg-ink hover:text-page transition-all duration-200 hover:scale-105 active:scale-95">
              {t("trips.browseRailJourneys")}
            </Link>
            <Link href="/packages" className="px-7 py-3.5 border border-line-strong text-ink text-xs tracking-[0.16em] uppercase rounded-sm hover:bg-ink hover:text-page transition-all duration-200 hover:scale-105 active:scale-95">
              {t("trips.browseBespokeJourneys")}
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map(trip => (
            <div key={trip.ref} className="bg-panel border border-line rounded-2xl shadow-card overflow-hidden flex flex-col sm:flex-row">
              {trip.image && (
                <div className="relative sm:w-52 shrink-0 aspect-[16/10] sm:aspect-auto">
                  <Image src={trip.image} alt={trip.title} fill sizes="(max-width: 640px) 100vw, 208px" className="object-cover" />
                </div>
              )}
              <div className="flex-1 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] tracking-[0.2em] uppercase text-gold">{trip.type}</span>
                    <span className="text-[10px] tracking-[0.1em] uppercase text-ink-faint">· Ref {trip.ref}</span>
                  </div>
                  <h3 className="font-serif text-xl font-light text-ink leading-snug">{trip.title}</h3>
                  <p className="text-sm text-ink-muted font-light">{trip.subtitle}</p>
                  <p className="text-xs text-ink-faint font-light mt-1">
                    {t("trips.booked")} {fmtDate(trip.bookedAt)}{trip.guestName ? ` · ${trip.guestName}` : ""}
                  </p>
                </div>
                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3">
                  <p className="font-serif text-2xl font-light text-ink">{format(trip.total)}</p>
                  <button
                    onClick={() => removeTrip(trip.ref)}
                    className="flex items-center gap-1.5 text-xs tracking-[0.1em] uppercase text-ink-faint hover:text-ink transition-colors"
                  >
                    <Trash2 size={13} /> {t("trips.cancel")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
