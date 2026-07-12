"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CalendarClock, BadgePercent, ShieldAlert, Bookmark, ArrowRight } from "lucide-react";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import type { PersonalizedHome as Data } from "@/lib/customer/personalized-home";

// A warm, personalised strip for signed-in members: a time-aware greeting plus
// smart cards (next trip, price drops on saved journeys, passport expiry).
// Self-fetches so the public home page stays static; renders nothing for guests.
export default function PersonalizedHome() {
  const { format } = useCurrency();
  const [data, setData] = useState<Data | null>(null);
  const [greeting, setGreeting] = useState("Welcome back");

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : h < 21 ? "Good evening" : "Good evening");
    fetch("/api/account/home").then(r => r.json()).then(d => { if (d?.loggedIn && d.data) setData(d.data); }).catch(() => {});
  }, []);

  if (!data) return null;

  const cards: React.ReactNode[] = [];

  if (data.nextTrip) {
    cards.push(
      <Link key="trip" href="/account" className="group rounded-2xl border border-line bg-panel-soft p-5 hover:border-gold/40 transition-colors">
        <CalendarClock size={17} className="text-gold mb-2.5" />
        <p className="text-[11px] tracking-[0.18em] uppercase text-ink-faint">Your next journey</p>
        <p className="text-sm font-medium text-ink mt-1 line-clamp-1">{data.nextTrip.title}</p>
        <p className="text-xs text-ink-muted mt-1">
          {data.nextTrip.daysToGo === 0 ? "Departing today ✦" : data.nextTrip.daysToGo === 1 ? "Departing tomorrow ✦" : `In ${data.nextTrip.daysToGo} days`}
        </p>
      </Link>,
    );
  }

  for (const d of data.priceDrops) {
    cards.push(
      <Link key={`drop-${d.href}`} href={d.href} className="group rounded-2xl border border-emerald-600/30 bg-emerald-500/[0.04] p-5 hover:border-emerald-600/60 transition-colors">
        <BadgePercent size={17} className="text-emerald-600 mb-2.5" />
        <p className="text-[11px] tracking-[0.18em] uppercase text-emerald-700">Price dropped {d.pct}%</p>
        <p className="text-sm font-medium text-ink mt-1 line-clamp-1">{d.title}</p>
        <p className="text-xs text-ink-muted mt-1">
          <span className="line-through text-ink-faint">{format(d.was)}</span> → <span className="text-ink font-medium">{format(d.now)}</span>
        </p>
      </Link>,
    );
  }

  if (data.passport) {
    const soon = data.passport.daysToExpiry <= 30;
    cards.push(
      <Link key="passport" href="/account" className={`group rounded-2xl border p-5 transition-colors ${soon ? "border-red-300 bg-red-50/50 hover:border-red-400" : "border-amber-300/50 bg-amber-50/40 hover:border-amber-400"}`}>
        <ShieldAlert size={17} className={soon ? "text-red-600 mb-2.5" : "text-amber-600 mb-2.5"} />
        <p className={`text-[11px] tracking-[0.18em] uppercase ${soon ? "text-red-600" : "text-amber-700"}`}>{data.passport.label} expiring</p>
        <p className="text-sm font-medium text-ink mt-1">
          {data.passport.daysToExpiry <= 0 ? "Expired" : `In ${data.passport.daysToExpiry} days`}
        </p>
        <p className="text-xs text-ink-muted mt-1">Many countries require six months&apos; validity.</p>
      </Link>,
    );
  }

  // Fallback card so the strip never feels empty.
  if (cards.length < 3) {
    cards.push(
      <Link key="saved" href="/account" className="group rounded-2xl border border-line bg-panel-soft p-5 hover:border-gold/40 transition-colors">
        <Bookmark size={17} className="text-gold mb-2.5" />
        <p className="text-[11px] tracking-[0.18em] uppercase text-ink-faint">Your shortlist</p>
        <p className="text-sm font-medium text-ink mt-1">{data.savedCount} saved {data.savedCount === 1 ? "journey" : "journeys"}</p>
        <p className="text-xs text-ink-muted mt-1 inline-flex items-center gap-1">Continue planning <ArrowRight size={12} /></p>
      </Link>,
    );
  }

  return (
    <section className="max-w-[1500px] mx-auto px-6 lg:px-12 pt-10 pb-2">
      <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-2">For you</p>
      <h2 className="font-serif text-2xl sm:text-3xl font-light text-ink">
        {greeting}{data.firstName ? `, ${data.firstName}` : ""}.
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {cards.slice(0, 3)}
      </div>
    </section>
  );
}
