"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

type Hit = { type: string; title: string; subtitle: string; href: string };

export default function AdminSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (q.trim().length < 2) { setHits([]); return; }
    const id = setTimeout(async () => {
      try {
        const r = await fetch(`/api/admin/search?q=${encodeURIComponent(q.trim())}`);
        const d = await r.json();
        setHits(d.results ?? []); setOpen(true);
      } catch { setHits([]); }
    }, 220);
    return () => clearTimeout(id);
  }, [q]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const go = (href: string) => { setOpen(false); setQ(""); router.push(href); };

  return (
    <div ref={box} className="relative flex-1 max-w-md">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        onFocus={() => hits.length && setOpen(true)}
        placeholder="Search bookings, enquiries, customers…"
        className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
      />
      {open && hits.length > 0 && (
        <div className="absolute z-50 mt-1 w-full sm:w-96 bg-white border border-gray-200 rounded-md shadow-lg max-h-96 overflow-y-auto">
          {hits.map((h, i) => (
            <button key={i} onClick={() => go(h.href)} className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-50 last:border-0">
              <span className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 shrink-0">{h.type}</span>
              <span className="min-w-0">
                <span className="block text-sm text-gray-900 truncate">{h.title}</span>
                <span className="block text-xs text-gray-400 truncate">{h.subtitle}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
