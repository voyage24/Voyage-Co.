"use client";

import { useEffect, useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useHideOnScroll } from "@/lib/useHideOnScroll";

// Floating scroll-to-top / scroll-to-bottom controls. Sits just above the
// WhatsApp button (bottom-5) so the two never overlap. Each arrow only
// appears when it has somewhere to go — the up arrow once you've scrolled
// down, the down arrow until you're near the bottom.
export default function ScrollButtons() {
  const [showUp, setShowUp] = useState(false);
  const [showDown, setShowDown] = useState(false);
  const hidden = useHideOnScroll();

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const docH = document.documentElement.scrollHeight;
      setShowUp(y > 300);
      setShowDown(y + window.innerHeight < docH - 300);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const toBottom = () => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });

  const btn =
    "w-11 h-11 sm:w-10 sm:h-10 flex items-center justify-center bg-ink text-page border border-ink shadow-md hover:bg-ink/90 transition-[transform,background-color] duration-200 hover:scale-110 active:scale-95";

  return (
    <div className={`fixed right-4 bottom-[9rem] sm:right-5 sm:bottom-20 z-40 flex flex-col gap-2 transition-all duration-300 ${hidden ? "translate-y-24 opacity-0 pointer-events-none" : "translate-y-0 opacity-100"}`}>
      {showUp && (
        <button onClick={toTop} aria-label="Scroll to top" className={btn}>
          <ChevronUp size={18} className="arrow-shimmer text-gold" />
        </button>
      )}
      {showDown && (
        <button onClick={toBottom} aria-label="Scroll to bottom" className={btn}>
          <ChevronDown size={18} className="arrow-shimmer text-gold" style={{ animationDelay: "1.2s" }} />
        </button>
      )}
    </div>
  );
}
