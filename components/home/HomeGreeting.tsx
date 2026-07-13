"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// A slim, personal greeting band at the very top of the home page for signed-in
// members — a warm, premium "welcome back" that sits directly beneath the navbar
// and flows into the dark hero. Self-fetches so the public home stays static;
// renders nothing for guests (and nothing until we know who's visiting).
export default function HomeGreeting() {
  const [name, setName] = useState<string | null>(null);
  const [greeting, setGreeting] = useState("Welcome back");

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
    fetch("/api/account/me")
      .then(r => r.json())
      .then(d => { if (d?.customer) setName(d.customer.name?.trim().split(" ")[0] || ""); })
      .catch(() => {});
  }, []);

  if (name === null) return null;

  return (
    // Sit clear of the fixed "under development" banner when it's showing
    // (it publishes its height as --dev-banner-h) so neither masks the other.
    <div className="bg-vc-950 border-b border-white/10 animate-fade-in" style={{ marginTop: "var(--dev-banner-h, 0px)" }}>
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12 py-3.5 flex items-center justify-between gap-4">
        <p className="font-serif text-lg sm:text-2xl font-light leading-none">
          <span className="shimmer-gold-hero">{greeting}{name ? `, ${name}` : ""}.</span>
          <span className="hidden sm:inline text-white/75 text-base"> Welcome back to <span className="shimmer-white">Voyages &amp; Co.</span></span>
        </p>
        <Link
          href="/my-voyages"
          className="sheen group shrink-0 inline-flex items-center gap-2 rounded-sm border border-gold/70 bg-gradient-to-r from-gold/15 via-gold/25 to-gold/15 px-4 py-2 text-[11px] font-medium tracking-[0.16em] uppercase text-gold shadow-[0_0_18px_-3px_rgba(212,175,95,0.7)] hover:shadow-[0_0_26px_-1px_rgba(212,175,95,0.95)] hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <span className="shimmer-gold-hero">My Voyages</span> <ArrowRight size={14} className="arrow-shimmer transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
