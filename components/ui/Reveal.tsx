"use client";

import { useEffect, useRef, useState } from "react";

type Variant = "up" | "left" | "right" | "zoom";
const VARIANT_CLASS: Record<Variant, string> = { up: "", left: "r-left", right: "r-right", zoom: "r-zoom" };

// Fades/rises its children in when they scroll into view. Respects
// prefers-reduced-motion (CSS handles that).
//   variant: direction of entrance · stagger: cascade direct children
export default function Reveal({ children, className = "", delay = 0, variant = "up", stagger = false, soft = false }: { children: React.ReactNode; className?: string; delay?: number; variant?: Variant; stagger?: boolean; soft?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Toggle on every enter/leave so the animation replays each time the
    // section scrolls back into view (not just the first time).
    const io = new IntersectionObserver(
      ([e]) => setShown(e.isIntersecting),
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const cls = soft ? "stagger-soft" : stagger ? "stagger" : `reveal ${VARIANT_CLASS[variant]}`;
  return (
    <div ref={ref} className={`${cls} ${shown ? "is-visible" : ""} ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  );
}
