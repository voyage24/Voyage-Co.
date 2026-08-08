"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, BedDouble, Plane, Compass, Luggage, Sparkles, Wand2, Search, Headset, Tag } from "lucide-react";
import { haptic } from "@/lib/haptics";

// Shown when the Home tab is tapped while already on the homepage (tapping
// it from anywhere else just navigates home, as usual) — quick jumps to a
// handful of high-value actions instead of a no-op re-navigation to "/".
const HOME_QUICK_LINKS = [
  { href: "/plan", label: "Smart Trip Planner", Icon: Wand2 },
  { href: "/trips", label: "My Bookings", Icon: Luggage },
  { href: "#home-search", label: "Search", Icon: Search },
  { href: "/offers", label: "Offers", Icon: Tag },
  { href: "/support", label: "Support", Icon: Headset },
];

// Phone bottom navigation — the quick-reach travel actions: browse & book
// (stays, flights), get inspired (explore), manage bookings (trips) and the
// member hub ("My Voyages"). The hub lives ONLY here (not the top bar) to avoid
// duplicating it; detailed account settings sit one tap deeper from the hub.
const TABS = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/hotels", label: "Stays", Icon: BedDouble },
  { href: "/flights", label: "Flights", Icon: Plane },
  { href: "/explore", label: "Explore", Icon: Compass },
  { href: "/trips", label: "Trips", Icon: Luggage },
  { href: "/my-voyages", label: "You", Icon: Sparkles },
];

export default function MobileTabBar() {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const [unread, setUnread] = useState(0);
  const [pending, setPending] = useState<string | null>(null);
  const [showHomeMenu, setShowHomeMenu] = useState(false);
  const homeMenuRef = useRef<HTMLDivElement>(null);

  // Highlight the tapped tab immediately; clear it once the new route commits
  // (the branded spinner then covers the actual load, and the now-active tab
  // keeps breathing as the "you are here" cue).
  useEffect(() => { setPending(null); setShowHomeMenu(false); }, [pathname]);

  useEffect(() => {
    if (!showHomeMenu) return;
    const handler = (e: MouseEvent) => {
      if (homeMenuRef.current && !homeMenuRef.current.contains(e.target as Node)) setShowHomeMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showHomeMenu]);

  const goToQuickLink = (href: string) => {
    setShowHomeMenu(false);
    haptic("select");
    if (href.startsWith("#")) {
      document.getElementById(href.slice(1))?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      router.push(href);
    }
  };

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
          const active = href === "/" ? pathname === "/"
            : href === "/my-voyages" ? (pathname.startsWith("/my-voyages") || pathname.startsWith("/account"))
            : pathname.startsWith(href);
          // Highlight instantly on tap (before the page loads), then a "breathing"
          // pulse while the destination is still loading.
          const isActive = active || pending === href;
          const loading = pending === href && !active;
          const tabClass = `group relative flex flex-col items-center justify-center gap-0.5 flex-1 transition-transform duration-150 active:scale-90 ${isActive ? "tab-active text-gold" : "text-ink-muted"}`;
          const inner = (
            <>
              {/* Gold indicator bar that slides in for the active tab */}
              <span className="tab-indicator pointer-events-none absolute top-0 h-[2px] w-7 rounded-full bg-gold" />
              <span className="relative">
                {loading && <>
                  <span className="tab-ring pointer-events-none absolute inset-0 -m-1.5 rounded-full bg-gold/55" />
                  <span className="tab-ring-2 pointer-events-none absolute inset-0 -m-1.5 rounded-full bg-gold/45" />
                </>}
                <Icon size={18} className={`relative ${isActive ? "tab-breathe" : "tab-pop"}`} />
                {href === "/my-voyages" && unread > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] px-1 rounded-full bg-gold text-vc-950 text-[9px] font-semibold leading-[15px] text-center">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </span>
              <span className="text-[8.5px] tracking-[0.02em] uppercase leading-none">{label}</span>
            </>
          );

          // Home, when already on the homepage, opens a quick-launch menu
          // instead of re-navigating to the same page (a no-op otherwise).
          // From anywhere else it's a plain link home, same as every other tab.
          if (href === "/" && active) {
            return (
              <div key={href} ref={homeMenuRef} className="relative flex-1 flex">
                {showHomeMenu && (
                  <div className="absolute bottom-full left-1 mb-3 w-52 bg-panel-raised border border-line rounded-xl shadow-luxury overflow-hidden animate-slide-up">
                    {HOME_QUICK_LINKS.map(({ href: qHref, label: qLabel, Icon: QIcon }) => (
                      <button
                        key={qHref}
                        type="button"
                        onClick={() => goToQuickLink(qHref)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-ink hover:bg-panel-soft transition-colors border-t border-line first:border-t-0"
                      >
                        <QIcon size={16} className="text-gold shrink-0" />
                        {qLabel}
                      </button>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => { haptic("select"); setShowHomeMenu(v => !v); }}
                  aria-expanded={showHomeMenu}
                  className={tabClass}
                >
                  {inner}
                </button>
              </div>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              onClick={() => { if (!active) { setPending(href); haptic("select"); } }}
              className={tabClass}
            >
              {inner}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
