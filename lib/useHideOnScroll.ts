"use client";

import { useEffect, useState } from "react";

// Returns true only while the user is actively scrolling down (past
// `threshold`); false when scrolling up, near the top, or once scrolling
// stops. So floating controls tuck away during a downward scroll and reappear
// the moment the page comes to rest. Shared by the concierge launcher,
// WhatsApp button and scroll controls for consistent behaviour.
export function useHideOnScroll(threshold = 140) {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    let idleTimer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      const y = window.scrollY;
      if (y < threshold) setHidden(false);
      else if (y > last + 6) setHidden(true);
      else if (y < last - 6) setHidden(false);
      last = y;
      // Reveal again once scrolling comes to a stop.
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => setHidden(false), 200);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); clearTimeout(idleTimer); };
  }, [threshold]);
  return hidden;
}
