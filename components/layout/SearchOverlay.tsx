"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

type Result = { type: string; title: string; subtitle: string; href: string; image?: string | null };

export default function SearchOverlay({ tone = "dark" }: { tone?: "dark" | "light" }) {
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
        <Search size={18} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-vc-950/60 backdrop-blur-sm" onClick={close} />
          <div className="relative max-w-2xl mx-auto mt-24 mx-4 sm:mx-auto bg-panel-raised border border-line shadow-luxury">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-line">
              <Search size={18} className="text-ink-faint shrink-0" />
              <input
                ref={inputRef}
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder={t("search.placeholder")}
                className="flex-1 bg-transparent text-ink placeholder:text-ink-faint outline-none text-base"
              />
              <button onClick={close} aria-label="Close" className="text-ink-faint hover:text-ink shrink-0"><X size={18} /></button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {loading && <p className="px-5 py-6 text-sm text-ink-faint">{t("search.searching")}</p>}
              {!loading && searched && results.length === 0 && (
                <p className="px-5 py-6 text-sm text-ink-faint">{t("search.noResults")}</p>
              )}
              {!loading && results.map(r => (
                <button
                  key={r.href}
                  onClick={() => go(r.href)}
                  className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-panel-soft transition-colors border-b border-line/50 last:border-0"
                >
                  {r.image && (
                    <span className="relative w-12 h-12 shrink-0 overflow-hidden border border-line">
                      <Image src={r.image} alt="" fill sizes="48px" className="object-cover" />
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block text-[10px] tracking-[0.18em] uppercase text-gold">{r.type}</span>
                    <span className="block text-sm text-ink font-medium truncate">{r.title}</span>
                    <span className="block text-xs text-ink-faint font-light truncate">{r.subtitle}</span>
                  </span>
                </button>
              ))}
              {!searched && !loading && (
                <p className="px-5 py-6 text-sm text-ink-faint font-light">{t("search.hint")}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
