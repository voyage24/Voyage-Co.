"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Item = { id: string; data: Record<string, string> };

// Partner logo wall — rendered on the Partners page from the admin Partner logos
// collection. Hidden until at least one logo is added.
export default function PartnerLogos() {
  const [items, setItems] = useState<Item[] | null>(null);

  useEffect(() => {
    fetch("/api/content/collections/partners")
      .then(r => r.json())
      .then(d => setItems(d.items ?? []))
      .catch(() => setItems([]));
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <div className="mb-14">
      <h2 className="font-serif text-2xl font-light text-ink mb-8 text-center">Our partners</h2>
      <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
        {items.map(p => {
          const logo = (
            <div className="relative h-12 w-32 opacity-70 hover:opacity-100 transition-opacity">
              <Image src={p.data.image} alt={p.data.name ?? ""} fill sizes="128px" className="object-contain" />
            </div>
          );
          return p.data.url
            ? <a key={p.id} href={p.data.url} target="_blank" rel="noopener noreferrer">{logo}</a>
            : <div key={p.id}>{logo}</div>;
        })}
      </div>
    </div>
  );
}
