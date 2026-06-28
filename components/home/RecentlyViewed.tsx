"use client";

import Link from "next/link";
import Image from "next/image";
import { useRecentlyViewed } from "@/lib/recently-viewed";

// Personalised homepage rail — shows the journeys this visitor last looked at.
// Renders nothing (no layout shift beyond mount) until there's history.
export default function RecentlyViewed() {
  const list = useRecentlyViewed();
  if (list.length < 2) return null;

  return (
    <section className="max-w-[1500px] mx-auto px-6 lg:px-12 py-14">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-2">For you</p>
          <h2 className="font-serif text-2xl sm:text-3xl font-light text-ink">Continue exploring</h2>
        </div>
      </div>
      <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2 -mx-1 px-1">
        {list.map(item => (
          <Link key={`${item.type}-${item.id}`} href={item.href} className="group shrink-0 w-56">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-2.5">
              <Image src={item.image} alt={item.title} fill sizes="224px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <p className="text-[10px] tracking-[0.18em] uppercase text-ink-faint">{item.type}</p>
            <p className="text-sm font-medium text-ink leading-snug line-clamp-2">{item.title}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
