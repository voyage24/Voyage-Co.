"use client";

import { useEffect, useState } from "react";

// Returns true while the user is scrolling down (past `threshold`), false when
// scrolling up or near the top — so floating controls can tuck away while
// reading and reappear on scroll-up. Shared by the concierge launcher,
// WhatsApp button and scroll controls for consistent behaviour.
export function useHideOnScroll(threshold = 140) {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y < threshold) setHidden(false);
      else if (y > last + 6) setHidden(true);
      else if (y < last - 6) setHidden(false);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return hidden;
}
