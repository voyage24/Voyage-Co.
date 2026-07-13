"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { X, TriangleAlert } from "lucide-react";

const KEY = "vc-dev-banner-dismissed";

// Temporary "under development" disclaimer, shown on the homepage only. Dismissed
// per browser session (reappears on the next visit) so it stays visible without
// nagging. Rendered at the body level (not inside the nav/transition) so its
// fixed positioning isn't affected by any backdrop-filter/transform ancestor.
export default function DevBanner() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { if (sessionStorage.getItem(KEY)) return; } catch { /* storage blocked */ }
    setShow(true);
  }, []);

  const visible = pathname === "/" && show;

  // Publish the banner's live height as a CSS variable so in-flow content that
  // starts at the top of the page (the member greeting band) can sit clear of
  // this fixed, persistent bar instead of being masked by it. Reset to 0 when
  // the banner is dismissed or absent.
  useEffect(() => {
    const root = document.documentElement;
    const el = ref.current;
    if (!visible || !el) { root.style.setProperty("--dev-banner-h", "0px"); return; }
    const set = () => root.style.setProperty("--dev-banner-h", `${el.offsetHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => { ro.disconnect(); root.style.setProperty("--dev-banner-h", "0px"); };
  }, [visible]);

  if (!visible) return null;

  const dismiss = () => {
    setShow(false);
    try { sessionStorage.setItem(KEY, "1"); } catch { /* ignore */ }
  };

  return (
    <div ref={ref} className="fixed top-20 inset-x-0 z-40 bg-vc-950/90 backdrop-blur border-b border-gold/30">
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12 py-2 flex items-center gap-3">
        <TriangleAlert size={15} className="text-gold shrink-0" />
        <p className="flex-1 text-[11px] sm:text-xs text-white/85 font-light leading-snug">
          <span className="font-medium text-white">Demonstration site — under development.</span>{" "}
          This is a portfolio project, not a live commercial travel service. Prices, availability, imagery and content are illustrative only and no bookings are fulfilled.
        </p>
        <button onClick={dismiss} aria-label="Dismiss notice" className="shrink-0 text-white/60 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
