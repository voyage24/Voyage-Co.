"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { haptic } from "@/lib/haptics";

// Pull-to-refresh for the installed PWA (standalone) — where there's no browser
// chrome to pull. Left off in normal browser tabs, which have their own native
// pull-to-refresh. Only reloads when pulled past the threshold from the top.
const THRESHOLD = 80;

export default function PullToRefresh() {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const active = useRef(false);

  useEffect(() => {
    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      // iOS Safari
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    const coarse = window.matchMedia?.("(hover: none) and (pointer: coarse)").matches;
    if (!standalone || !coarse) return;

    const onStart = (e: TouchEvent) => {
      if (window.scrollY <= 0 && !refreshing) { startY.current = e.touches[0].clientY; active.current = true; }
    };
    const onMove = (e: TouchEvent) => {
      if (!active.current || startY.current === null) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy > 0 && window.scrollY <= 0) {
        setPull(Math.min(dy * 0.5, THRESHOLD + 30));
      } else {
        active.current = false; setPull(0);
      }
    };
    const onEnd = () => {
      if (!active.current) return;
      active.current = false;
      setPull(p => {
        if (p >= THRESHOLD) { haptic("select"); setRefreshing(true); setTimeout(() => window.location.reload(), 150); }
        return 0;
      });
      startY.current = null;
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [refreshing]);

  const show = pull > 4 || refreshing;
  if (!show) return null;

  return (
    <div
      className="fixed inset-x-0 top-0 z-[60] flex justify-center pointer-events-none"
      style={{ transform: `translateY(${refreshing ? 16 : Math.min(pull, THRESHOLD) - 8}px)` }}
    >
      <div className="mt-2 rounded-full bg-panel border border-line shadow-luxury p-2">
        <Loader2
          size={18}
          className={`text-gold ${refreshing ? "animate-spin" : ""}`}
          style={{ transform: refreshing ? undefined : `rotate(${pull * 3}deg)` }}
        />
      </div>
    </div>
  );
}
