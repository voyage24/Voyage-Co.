"use client";

import { useEffect } from "react";

// Subtle site-wide haptic feedback on tap. Uses the Web Vibration API, which
// is supported on Android browsers; iOS Safari does not expose vibration to
// the web, so it's a graceful no-op there. Only active on touch / coarse-
// pointer devices so desktop clicks never trigger it.
const INTERACTIVE = "a, button, [role=button], input[type=submit], input[type=button], input[type=checkbox], input[type=radio], label, select, summary";

export default function Haptics() {
  useEffect(() => {
    if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
    const coarse = window.matchMedia?.("(hover: none) and (pointer: coarse)").matches;
    if (!coarse) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest(INTERACTIVE)) {
        try { navigator.vibrate(12); } catch { /* ignore */ }
      }
    };

    document.addEventListener("pointerdown", onPointerDown, { passive: true });
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return null;
}
