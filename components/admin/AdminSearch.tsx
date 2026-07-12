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
  const [active, setActive] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (q.trim().length < 2) { setHits([]); return; }
    const id = setTimeout(async () => {
      try {
        const r = await fetch(`/api/admin/search?q=${encodeURIComponent(q.trim())}`);
        const d = await r.json();
        setHits(d.results ?? []); setActive(0); setOpen(true);
      } catch { setHits([]); }
    }, 220);
    return () => clearTimeout(id);
  }, [q]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    // ⌘K / Ctrl-K focuses the palette from anywhere.
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onClick); document.removeEventListener("keydown", onKey); };
  }, []);

  const go = (href: string) => { setOpen(false); setQ(""); router.push(href); };

  const onInputKey = (e: React.KeyboardEvent) => {
    if (!open || hits.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => (a + 1) % hits.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(a => (a - 1 + hits.length) % hits.length); }
    else if (e.key === "Enter") { e.preventDefault(); go(hits[active].href); }
    else if (e.key === "Escape") { setOpen(false); }
  };

  return (
    <div ref={box} className="relative flex-1 max-w-md">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        ref={inputRef}
        value={q}
        onChange={e => setQ(e.target.value)}
        onFocus={() => hits.length && setOpen(true)}
        onKeyDown={onInputKey}
        placeholder="Search bookings, enquiries, customers…"
        className="w-full pl-9 pr-12 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
      />
      <kbd className="hidden sm:flex absolute right-2.5 top-1/2 -translate-y-1/2 items-center gap-0.5 text-[10px] text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 pointer-events-none">⌘K</kbd>
      {open && hits.length > 0 && (
        <div className="absolute z-50 mt-1 w-full sm:w-96 bg-white border border-gray-200 rounded-md shadow-lg max-h-96 overflow-y-auto">
          {hits.map((h, i) => (
            <button
              key={i}
              onMouseEnter={() => setActive(i)}
              onClick={() => go(h.href)}
              className={`w-full text-left px-3 py-2 flex items-center gap-3 border-b border-gray-50 last:border-0 ${i === active ? "bg-gray-100" : "hover:bg-gray-50"}`}
            >
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
