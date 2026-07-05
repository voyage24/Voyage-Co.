"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BedDouble, Plane, Compass, Luggage, User } from "lucide-react";

// Phone bottom navigation — the quick-reach travel actions: browse & book
// (stays, flights), get inspired (explore), manage bookings (trips) and the
// account. Account lives ONLY here (not the top bar) to avoid duplicating it.
const TABS = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/hotels", label: "Stays", Icon: BedDouble },
  { href: "/flights", label: "Flights", Icon: Plane },
  { href: "/explore", label: "Explore", Icon: Compass },
  { href: "/trips", label: "Trips", Icon: Luggage },
  { href: "/account", label: "Account", Icon: User },
];

export default function MobileTabBar() {
  const pathname = usePathname() || "/";
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
          return (
            <Link
              key={href}
              href={href}
              className={`group relative flex flex-col items-center justify-center gap-0.5 flex-1 transition-transform duration-150 active:scale-90 ${active ? "tab-active text-gold" : "text-ink-muted"}`}
            >
              {/* Gold indicator bar that slides in for the active tab */}
              <span className="tab-indicator pointer-events-none absolute top-0 h-[2px] w-7 rounded-full bg-gold" />
              <Icon size={18} className="tab-pop" />
              <span className="text-[9px] tracking-[0.08em] uppercase">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
