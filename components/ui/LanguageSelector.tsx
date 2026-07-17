"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { LANGUAGES } from "@/lib/languages";
import { languageFlag } from "@/lib/flags";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useHoverMenu } from "@/lib/useHoverMenu";

export default function LanguageSelector({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const { language, setLanguageCode, t } = useLanguage();
  const { open, rendered, setOpen, viaHover, toggle, hoverProps } = useHoverMenu();
  const [mounted, setMounted] = useState(false);
  const [query, setQuery]     = useState("");
  const [dropStyle, setDropStyle] = useState<React.CSSProperties>({});

  const wrapRef = useRef<HTMLDivElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Only grab focus when opened deliberately, never on a passing hover.
  useEffect(() => { if (open && !viaHover) searchRef.current?.focus(); }, [open, viaHover]);

  const calcPos = () => {
    if (!wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    const width  = 300;
    const margin = 16;
    let left = r.right - width;
    if (left < margin) left = margin;
    if (left + width > window.innerWidth - margin) left = window.innerWidth - width - margin;

    const spaceBelow = window.innerHeight - r.bottom - margin;
    const preferred  = 380;
    const maxHeight  = Math.max(220, Math.min(preferred, spaceBelow));
    setDropStyle({ top: r.bottom + 8, left, maxHeight });
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!wrapRef.current?.contains(target) && !dropRef.current?.contains(target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Keeps the dropdown anchored to the button as the page scrolls — it's
  // portaled with position:fixed (viewport coordinates), so without this
  // it would stay frozen in place while the rest of the page scrolls past it.
  useEffect(() => {
    if (!open) return;
    const reposition = () => calcPos();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LANGUAGES;
    return LANGUAGES.filter(l => l.name.toLowerCase().includes(q) || l.nativeName.toLowerCase().includes(q));
  }, [query]);

  const color = tone === "light" ? "text-white/90 hover:text-white" : "text-ink-muted hover:text-ink";
  const maxH = (dropStyle as { maxHeight?: number }).maxHeight;

  return (
    <div
      ref={wrapRef}
      className="relative group"
      onPointerEnter={() => { calcPos(); hoverProps.onPointerEnter(); }}
      onPointerLeave={hoverProps.onPointerLeave}
    >
      <button
        type="button"
        onClick={() => { calcPos(); toggle(); }}
        className={`inline-flex items-center gap-1 text-[13px] font-normal tracking-[0.08em] uppercase transition-all duration-200 py-2 shrink-0 hover:scale-110 active:scale-95 ${color}`}
        aria-label={t("languageSelector.selectLanguage")}
      >
        <span className="flag text-[15px] leading-none">{languageFlag(language.code)}</span>
        <span className="hidden sm:inline">{language.code.toUpperCase()}</span>
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {!open && (
        <span className="hidden lg:block pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2.5 px-2.5 py-1 bg-vc-950 text-white text-[10px] tracking-[0.12em] uppercase whitespace-nowrap rounded-sm opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 z-[9999]">
          {t("languageSelector.selectLanguage")}
        </span>
      )}

      {rendered && mounted && createPortal(
        <div
          ref={dropRef}
          {...hoverProps}
          style={{ ...dropStyle, position: "fixed", zIndex: 9999, display: "flex", flexDirection: "column" }}
          className={`${open ? "animate-menu-drop" : "animate-menu-lift"} bg-panel-raised border border-line shadow-luxury w-[300px] max-w-[92vw] overflow-hidden`}
        >
          <div className="p-3 border-b border-line shrink-0">
            <input
              ref={searchRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t("languageSelector.searchPlaceholder")}
              className="w-full bg-panel border border-line px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none font-light"
            />
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: maxH ? maxH - 64 : undefined }}>
            {matches.length === 0 ? (
              <div className="px-4 py-4 text-sm text-ink-faint font-light">{t("languageSelector.noResults")}</div>
            ) : (
              matches.map(l => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => { setLanguageCode(l.code); setOpen(false); setQuery(""); }}
                  className={`w-full px-4 py-2.5 text-left hover:bg-panel-soft transition-colors flex items-center justify-between gap-3 border-b border-line last:border-0 ${
                    l.code === language.code ? "bg-panel-soft" : ""
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <span className="flag text-base leading-none shrink-0">{languageFlag(l.code)}</span>
                    <span className="text-sm font-medium text-ink w-9 shrink-0 uppercase">{l.code}</span>
                    <span className="text-xs text-ink-faint font-light truncate">{l.name}</span>
                  </span>
                  <span className="text-sm text-gold font-medium shrink-0 truncate max-w-[100px]">{l.nativeName}</span>
                </button>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
