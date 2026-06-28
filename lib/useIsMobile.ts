"use client";

import { useEffect, useState } from "react";

// True on small (phone) viewports. Used to fit interactive maps to the whole
// frame on phones instead of cropping/zooming a wide map into a tall portrait.
export function useIsMobile(query = "(max-width: 640px)") {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setIsMobile(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return isMobile;
}
