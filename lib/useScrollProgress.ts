"use client";

import { useEffect, useState, type RefObject } from "react";

// Tracks how far the viewport has scrolled through a tall "track" element, as
// a 0→1 progress value: 0 when the track's top reaches the top of the
// viewport, 1 when its bottom reaches the bottom. Drives scroll-scrubbed
// sequences (see ScrollStory). Same passive-listener + rAF idiom as
// useShowOnScroll/useHideOnScroll. `reduced` mirrors the
// prefers-reduced-motion check Counter.tsx already does, so callers can skip
// the scrub mechanics entirely and just show settled content.
export function useScrollProgress<T extends HTMLElement>(ref: RefObject<T>) {
  const [progress, setProgress] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduced(true);
      setProgress(1);
      return;
    }

    let raf = 0;
    const measure = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = total > 0 ? -rect.top / total : 0;
      setProgress(Math.min(1, Math.max(0, p)));
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [ref]);

  return { progress, reduced };
}
