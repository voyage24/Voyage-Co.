"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BedDouble, Plane, Compass, Luggage, User } from "lucide-react";
import { haptic } from "@/lib/haptics";

// Phone bottom navigation — the quick-reach travel actions: browse & book
// (stays, flights), get inspired (explore), manage bookings (trips) and the
// account. Account lives ONLY here (not the top bar) to avoid duplicating it.
const TABS = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/hotels", label: "Stays", Icon: BedDouble },
  { href: "/flights", label: "Flights", Icon: Plane },
  { href: "/explore", label: "Explore", Icon: Compass },
  { href: "/trips", label: "Trips", Icon: Luggage },
  { href: "/account", label: "You", Icon: User },
];

export default function MobileTabBar() {
  const pathname = usePathname() || "/";
  const [unread, setUnread] = useState(0);
  const [pending, setPending] = useState<string | null>(null);

  // Clear the "tapped" highlight once navigation to the new route completes.
  useEffect(() => { setPending(null); }, [pathname]);

  // Unread notification count on the "You" tab, so it's clear where a
  // notification landed. Refetches when the app refocuses or the route changes,
  // and clears instantly when the inbox is marked read.
  useEffect(() => {
    const load = () => fetch("/api/account/notifications").then(r => r.json()).then(d => setUnread(d.loggedIn ? d.unread : 0)).catch(() => {});
    load();
    const onVisible = () => { if (document.visibilityState === "visible") load(); };
    const onRead = () => setUnread(0);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("vc-notifications-read", onRead);
    return () => { document.removeEventListener("visibilitychange", onVisible); window.removeEventListener("vc-notifications-read", onRead); };
  }, [pathname]);

  return (
    <nav
      className="sm:hidden print:hidden fixed bottom-0 left-0 right-0 z-40 bg-page/95 backdrop-blur-md border-t border-line animate-slide-up"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
        maxWidth: "100vw",
      }}
    >
      <div className="flex items-stretch justify-around h-14 px-1">
        {TABS.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          // Highlight instantly on tap (before the page loads), then a "breathing"
          // pulse while the destination is still loading.
          const isActive = active || pending === href;
          const loading = pending === href && !active;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => { if (!active) { setPending(href); haptic("select"); } }}
              className={`group relative flex flex-col items-center justify-center gap-0.5 flex-1 transition-transform duration-150 active:scale-90 ${isActive ? "tab-active text-gold" : "text-ink-muted"}`}
            >
              {/* Gold indicator bar that slides in for the active tab */}
              <span className="tab-indicator pointer-events-none absolute top-0 h-[2px] w-7 rounded-full bg-gold" />
              <span className="relative">
                {loading && <>
                  <span className="tab-ring pointer-events-none absolute inset-0 -m-1.5 rounded-full bg-gold/55" />
                  <span className="tab-ring-2 pointer-events-none absolute inset-0 -m-1.5 rounded-full bg-gold/45" />
                </>}
                <Icon size={18} className={`relative ${loading ? "tab-breathe" : "tab-pop"}`} />
                {href === "/account" && unread > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] px-1 rounded-full bg-gold text-vc-950 text-[9px] font-semibold leading-[15px] text-center">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </span>
              <span className="text-[8.5px] tracking-[0.02em] uppercase leading-none">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
