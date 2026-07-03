"use client";

import { useEffect, useState } from "react";

// Returns true while the user is actively scrolling (and for a short `idle`
// window after they stop), false when the page is at rest. The concierge &
// WhatsApp launchers stay hidden by default and only peek in during scrolling,
// so they never distract while the page is being read.
export function useShowOnScroll(idle = 2000) {
  const [scrolling, setScrolling] = useState(false);
  useEffect(() => {
    let idleTimer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      setScrolling(true);
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => setScrolling(false), idle);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); clearTimeout(idleTimer); };
  }, [idle]);
  return scrolling;
}
