"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, X } from "lucide-react";

type SavedSearch = { id: string; type: string; label: string; href: string };

export default function SavedSearchesList() {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/account/searches").then(r => r.json()).then(d => { setSearches(d.searches ?? []); setLoaded(true); }).catch(() => setLoaded(true));
  }, []);

  const remove = async (id: string) => {
    setSearches(s => s.filter(x => x.id !== id));
    await fetch(`/api/account/searches/${id}`, { method: "DELETE" });
  };

  if (!loaded || searches.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="font-serif text-2xl font-light text-ink mb-1">Saved searches</h2>
      <p className="text-sm text-ink-muted font-light mb-4">We&apos;ll email you when new journeys match.</p>
      <div className="space-y-2">
        {searches.map(s => (
          <div key={s.id} className="flex items-center gap-3 bg-panel border border-line rounded-xl px-4 py-3">
            <Bell size={15} className="text-gold shrink-0" />
            <Link href={s.href} className="text-sm text-ink hover:text-gold flex-1 truncate">{s.label}</Link>
            <button onClick={() => remove(s.id)} className="text-ink-faint hover:text-ink" aria-label="Remove saved search"><X size={16} /></button>
          </div>
        ))}
      </div>
    </section>
  );
}
