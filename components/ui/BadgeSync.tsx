"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Keeps the app-icon badge (Badging API) in sync with the member's unread
// notification count — updated on incoming push by the service worker, and
// reconciled here whenever the app is opened or refocused. No-op where the
// Badging API isn't supported (most browser tabs; works in installed PWAs).
export default function BadgeSync() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    // The admin / Voyages Mail app has its own notification model — don't set
    // the installed app's badge from the customer unread count there.
    if (isAdmin) return;
    const nav = navigator as Navigator & { setAppBadge?: (n?: number) => Promise<void>; clearAppBadge?: () => Promise<void> };
    if (!nav.setAppBadge) return;

    const sync = () => {
      fetch("/api/account/notifications")
        .then(r => r.json())
        .then(d => {
          if (!d?.loggedIn) { nav.clearAppBadge?.(); return; }
          if (d.unread > 0) nav.setAppBadge?.(d.unread); else nav.clearAppBadge?.();
        })
        .catch(() => {});
    };

    sync();
    const onVisible = () => { if (document.visibilityState === "visible") sync(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [isAdmin]);

  return null;
}
