"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Item = { id: string; data: Record<string, string> };

// "Meet the team" — rendered on the About page from the admin Team collection.
// Hidden entirely until at least one member is added.
export default function TeamSection() {
  const [items, setItems] = useState<Item[] | null>(null);

  useEffect(() => {
    fetch("/api/content/collections/team")
      .then(r => r.json())
      .then(d => setItems(d.items ?? []))
      .catch(() => setItems([]));
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <div className="mb-12">
      <h2 className="font-serif text-3xl font-light text-ink mb-6">Meet the team</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {items.map(m => (
          <div key={m.id} className="text-center">
            {m.data.image && (
              <div className="relative aspect-square mb-3 rounded-2xl overflow-hidden border border-line">
                <Image src={m.data.image} alt={m.data.name ?? ""} fill sizes="200px" className="object-cover" />
              </div>
            )}
            <p className="font-serif text-lg font-light text-ink leading-snug">{m.data.name}</p>
            {m.data.role && <p className="text-[11px] tracking-[0.12em] uppercase text-gold mt-0.5">{m.data.role}</p>}
            {m.data.bio && <p className="text-xs text-ink-muted font-light mt-2 leading-relaxed">{m.data.bio}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
