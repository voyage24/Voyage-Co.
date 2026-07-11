"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRecentlyViewed } from "@/lib/recently-viewed";

type Rec = { type: string; id: string; title: string; image: string; href: string; subtitle?: string };

// Taste-based "Recommended for you" rail. Sends the visitor's recently-viewed
// refs to /api/content/recommendations, which derives their taste and returns
// new properties that match. Renders nothing until there are recommendations,
// and never repeats what they've already viewed.
export default function Recommendations() {
  const viewed = useRecentlyViewed();
  const [items, setItems] = useState<Rec[]>([]);
  const [reason, setReason] = useState<string | null>(null);

  useEffect(() => {
    if (viewed.length < 1) return;
    let on = true;
    fetch("/api/content/recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ viewed: viewed.map(v => ({ type: v.type, id: v.id })) }),
    })
      .then(r => r.json())
      .then(d => { if (on && Array.isArray(d?.items)) { setItems(d.items); setReason(d.reason || null); } })
      .catch(() => {});
    return () => { on = false; };
  }, [viewed]);

  if (items.length < 3) return null;

  return (
    <section className="max-w-[1500px] mx-auto px-6 lg:px-12 py-14">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-2">Recommended for you</p>
          <h2 className="font-serif text-2xl sm:text-3xl font-light text-ink">
            {reason ? `More to discover in ${reason}` : "Curated to your taste"}
          </h2>
        </div>
      </div>
      <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2 -mx-1 px-1">
        {items.map(item => (
          <Link key={`${item.type}-${item.id}`} href={item.href} className="group shrink-0 w-56">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-2.5">
              <Image src={item.image} alt={item.title} fill sizes="224px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <p className="text-[10px] tracking-[0.18em] uppercase text-ink-faint">{item.subtitle || item.type}</p>
            <p className="text-sm font-medium text-ink leading-snug line-clamp-2">{item.title}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
