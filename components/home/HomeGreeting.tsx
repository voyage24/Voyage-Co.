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
    <div className="bg-vc-950 border-b border-white/10 animate-fade-in">
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12 py-3.5 flex items-center justify-between gap-4">
        <p className="font-serif text-lg sm:text-xl font-light leading-none">
          <span className="text-gold">{greeting}{name ? `, ${name}` : ""}.</span>
          <span className="hidden sm:inline text-white/50 text-base"> Welcome back to Voyages &amp; Co.</span>
        </p>
        <Link
          href="/my-voyages"
          className="shrink-0 inline-flex items-center gap-1.5 text-[11px] tracking-[0.16em] uppercase text-white/80 hover:text-gold transition-colors"
        >
          My Voyages <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
