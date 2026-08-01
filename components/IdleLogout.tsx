"use client";

import { useEffect, useRef } from "react";

const ACTIVITY_EVENTS = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"] as const;

// The real security boundary is server-side (lib/customer/session.ts,
// lib/admin/session.ts auto-expiring an idle session), which blocks the next
// request regardless of this component. This just makes an already-open,
// unattended tab redirect to login proactively instead of sitting there
// unlocked until someone happens to navigate again.
export default function IdleLogout({ timeoutMs, logoutPath, loginPath }: { timeoutMs: number; logoutPath: string; loginPath: string }) {
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const signOut = () => {
      fetch(logoutPath, { method: "POST" }).finally(() => {
        window.location.href = `${loginPath}?reason=idle`;
      });
    };
    const reset = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(signOut, timeoutMs);
    };
    ACTIVITY_EVENTS.forEach(e => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      ACTIVITY_EVENTS.forEach(e => window.removeEventListener(e, reset));
      if (timer.current) clearTimeout(timer.current);
    };
  }, [timeoutMs, logoutPath, loginPath]);

  return null;
}
