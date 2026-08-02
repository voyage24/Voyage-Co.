"use client";

import Image from "next/image";
import Link from "next/link";
import { Users, CheckCircle, Car } from "lucide-react";
import type { AirportCab } from "@/lib/types";
import { useCurrency } from "@/components/providers/CurrencyProvider";

export default function AirportCabCard({ cab }: { cab: AirportCab }) {
  const { format } = useCurrency();
  return (
    <div className="bg-panel rounded-2xl border border-line hover:border-gold/40 shadow-card hover:shadow-card-hover hover:-translate-y-1.5 transition-all duration-500 overflow-hidden group">
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image src={cab.image} alt={cab.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-vc-950/60 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          {cab.badge && (
            <span className="text-[9px] font-medium tracking-[0.15em] uppercase text-gold border border-gold/50 bg-vc-950/70 backdrop-blur-sm px-2.5 py-1 rounded-sm">{cab.badge}</span>
          )}
          <span className="text-[9px] font-medium tracking-[0.15em] uppercase text-white/90 bg-vc-950/50 backdrop-blur-sm px-2.5 py-1 rounded-sm">{cab.vehicleType}</span>
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white/90 text-xs font-light">
          <Car size={12} className="text-gold" />
          {cab.city}
        </div>
      </div>

      <div className="p-5">
        <p className="text-[11px] tracking-[0.14em] uppercase text-gold mb-1 font-light">Airport Transfer</p>
        <Link href={`/airport-cabs/${cab.id}`}>
          <h3 className="font-serif text-lg font-light text-ink leading-snug mb-2 line-clamp-2 hover:text-gold transition-colors">{cab.title}</h3>
        </Link>
        <div className="flex items-center gap-3 text-xs text-ink-muted mb-4 font-light">
          <span className="flex items-center gap-1"><Users size={11} className="text-gold" /> {cab.capacity}</span>
        </div>

        <ul className="space-y-1.5 mb-5">
          {cab.includes.slice(0, 3).map(inc => (
            <li key={inc} className="flex items-center gap-2 text-xs text-ink-muted font-light">
              <CheckCircle size={11} className="text-gold shrink-0" />
              {inc}
            </li>
          ))}
        </ul>

        <div className="flex items-end justify-between pt-4 border-t border-line">
          <div>
            <p className="text-[10px] tracking-[0.1em] uppercase text-ink-faint font-light">{cab.priceOnRequest ? "Price" : "Per transfer, from"}</p>
            <p className="font-serif text-2xl font-light text-ink">{cab.priceOnRequest ? "On request" : format(cab.price)}</p>
          </div>
          <Link href={`/book?type=airport-cab&id=${cab.id}`} className="px-5 py-2.5 border border-line-strong text-ink hover:bg-ink hover:text-page text-xs font-normal tracking-[0.12em] uppercase rounded-sm transition-all duration-300">
            Reserve
          </Link>
        </div>
      </div>
    </div>
  );
}
