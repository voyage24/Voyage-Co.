"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CalendarClock, BadgePercent, ShieldAlert, Bookmark, ArrowRight, CloudRain } from "lucide-react";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import type { PersonalizedHome as Data, PriceDrop } from "@/lib/customer/personalized-home";

// A warm, personalised strip for signed-in members: a time-aware greeting plus
// smart cards (next trip, price drops on saved journeys, passport expiry).
// Self-fetches so the public home page stays static; renders nothing for guests.
export default function PersonalizedHome() {
  const { format } = useCurrency();
  const [data, setData] = useState<Data | null>(null);
  const [viewedDrops, setViewedDrops] = useState<PriceDrop[]>([]);
  const [greeting, setGreeting] = useState("Welcome back");

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : h < 21 ? "Good evening" : "Good evening");
    fetch("/api/account/home").then(r => r.json()).then(d => { if (d?.loggedIn && d.data) setData(d.data); }).catch(() => {});

    // Price drops among journeys the visitor recently viewed (price recorded then).
    let items: { type: string; id: string; title: string; image?: string; href: string; price?: number }[] = [];
    try { items = JSON.parse(localStorage.getItem("vc-recently-viewed") || "[]"); } catch { /* ignore */ }
    const withPrice = items.filter(i => typeof i.price === "number" && (i.price as number) > 0);
    if (!withPrice.length) return;
    fetch("/api/content/price-check", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: withPrice.map(i => ({ type: i.type, id: i.id })) }) })
      .then(r => r.json())
      .then(d => {
        const prices: Record<string, number> = d?.prices || {};
        const drops: PriceDrop[] = [];
        for (const i of withPrice) {
          const now = prices[`${i.type}:${i.id}`];
          if (typeof now === "number" && now < (i.price as number)) {
            const pct = Math.round((((i.price as number) - now) / (i.price as number)) * 100);
            if (pct >= 5) drops.push({ title: i.title, href: i.href, image: i.image ?? null, was: i.price as number, now, pct });
          }
        }
        drops.sort((a, b) => b.pct - a.pct);
        setViewedDrops(drops);
      })
      .catch(() => {});
  }, []);

  if (!data) return null;

  // Merge saved + recently-viewed drops, de-duped by link.
  const seenDrop = new Set<string>();
  const allDrops = [...data.priceDrops, ...viewedDrops].filter(d => (seenDrop.has(d.href) ? false : seenDrop.add(d.href)));

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

  for (const d of allDrops) {
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

  if (data.weather && data.weather.alternatives.length > 0) {
    const alt = data.weather.alternatives[0];
    cards.push(
      <Link key="weather" href={alt.href} className="group rounded-2xl border border-sky-300/50 bg-sky-50/40 p-5 hover:border-sky-400 transition-colors">
        <CloudRain size={17} className="text-sky-600 mb-2.5" />
        <p className="text-[11px] tracking-[0.18em] uppercase text-sky-700">{data.weather.place} looks wet</p>
        <p className="text-sm font-medium text-ink mt-1">Chase the sun instead</p>
        <p className="text-xs text-ink-muted mt-1 line-clamp-1">{alt.title} · {alt.country}</p>
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
