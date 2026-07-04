"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Search, X, ChevronLeft } from "lucide-react";

/**
 * Full-screen mobile picker used by the flight/hotel/train search fields. The
 * search box is OPT-IN — it is never auto-focused, so tapping a field opens
 * the list without popping the keyboard; the traveller taps the box to type.
 * Full-screen + body-scroll-lock + a 16px input keep iOS from zooming into the
 * field or shifting the page when the keyboard opens or is dismissed.
 */
export default function MobilePickerSheet({
  title, query, onQueryChange, onClose, searchPlaceholder, children,
}: {
  title: string;
  query: string;
  onQueryChange: (q: string) => void;
  onClose: () => void;
  searchPlaceholder?: string;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);
  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col bg-panel-raised text-ink">
      {/* Header: title row + opt-in search row */}
      <div className="shrink-0 border-b border-line" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="flex items-center gap-1 px-2 pt-2">
          <button type="button" onClick={onClose} aria-label="Back" className="p-2 -ml-1 text-ink-muted hover:text-ink shrink-0">
            <ChevronLeft size={22} />
          </button>
          <p className="text-sm font-medium text-ink truncate">{title}</p>
        </div>
        <div className="px-3 pb-3 pt-2">
          <div className="flex items-center gap-2 bg-panel-soft border border-line px-3">
            <Search size={16} className="text-ink-faint shrink-0" />
            <input
              value={query}
              onChange={e => onQueryChange(e.target.value)}
              placeholder={searchPlaceholder ?? "Search…"}
              aria-label={title}
              autoComplete="off"
              inputMode="text"
              // text-base = 16px: below 16px iOS auto-zooms on focus and never
              // zooms back, which is the layout "toss".
              className="w-full bg-transparent py-2.5 text-base text-ink placeholder:text-ink-faint focus:outline-none font-light"
            />
            {query && (
              <button type="button" onClick={() => onQueryChange("")} aria-label="Clear" className="shrink-0 text-ink-faint hover:text-ink">
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
      <div
        className="flex-1 overflow-y-auto overscroll-contain"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
