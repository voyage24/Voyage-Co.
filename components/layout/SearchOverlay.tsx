"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

type Result = { type: string; title: string; subtitle: string; href: string; image?: string | null };

export default function SearchOverlay({ tone = "dark", triggerSize = 18 }: { tone?: "dark" | "light"; triggerSize?: number }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Debounced search.
  useEffect(() => {
    if (q.trim().length < 2) { setResults([]); setSearched(false); return; }
    setLoading(true);
    const id = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
        const data = await res.json();
        setResults(data.results ?? []);
      } catch { setResults([]); }
      finally { setLoading(false); setSearched(true); }
    }, 250);
    return () => clearTimeout(id);
  }, [q]);

  const close = useCallback(() => { setOpen(false); setQ(""); setResults([]); setSearched(false); }, []);

  const go = (href: string) => { close(); router.push(href); };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={t("search.label")}
        className={`transition-all duration-200 hover:scale-110 active:scale-95 ${tone === "light" ? "text-white/90 hover:text-white" : "text-ink-muted hover:text-ink"}`}
      >
        <Search size={triggerSize} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-20 sm:pt-28">
          <div className="absolute inset-0 bg-vc-950/70 backdrop-blur-md animate-fade-in" onClick={close} />
          <div className="relative w-full max-w-2xl bg-panel-raised border border-line shadow-luxury animate-fade-up">
            {/* Search field */}
            <div className="flex items-center gap-3 px-5 sm:px-6 py-5 border-b border-line">
              <Search size={20} className="text-gold shrink-0" />
              <input
                ref={inputRef}
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder={t("search.placeholder")}
                className="flex-1 bg-transparent text-ink placeholder:text-ink-faint outline-none text-lg font-light"
              />
              <button onClick={close} aria-label="Close" className="text-ink-faint hover:text-ink shrink-0 transition-colors"><X size={20} /></button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {loading && <p className="px-6 py-8 text-sm text-ink-faint font-light">{t("search.searching")}</p>}
              {!loading && searched && results.length === 0 && (
                <p className="px-6 py-8 text-sm text-ink-faint font-light">{t("search.noResults")}</p>
              )}
              {!loading && results.map(r => (
                <button
                  key={r.href}
                  onClick={() => go(r.href)}
                  className="group w-full flex items-center gap-4 px-5 sm:px-6 py-3.5 text-left hover:bg-panel-soft transition-colors border-b border-line/40 last:border-0"
                >
                  {r.image && (
                    <span className="relative w-14 h-14 shrink-0 overflow-hidden border border-line">
                      <Image src={r.image} alt="" fill sizes="56px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] tracking-[0.2em] uppercase text-gold mb-0.5">{r.type}</span>
                    <span className="block font-serif text-base font-light text-ink truncate">{r.title}</span>
                    <span className="block text-xs text-ink-faint font-light truncate">{r.subtitle}</span>
                  </span>
                  <Search size={14} className="text-ink-faint opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </button>
              ))}
              {!searched && !loading && (
                <p className="px-6 py-8 text-sm text-ink-faint font-light leading-relaxed">{t("search.hint")}</p>
              )}
            </div>

            {/* Footer hint */}
            <div className="px-6 py-3 border-t border-line bg-panel-soft/50 flex items-center justify-between">
              <span className="text-[10px] tracking-[0.16em] uppercase text-ink-faint">Voyages &amp; Co.</span>
              <span className="text-[10px] tracking-[0.12em] uppercase text-ink-faint">esc</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
