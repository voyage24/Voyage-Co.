"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BedDouble, Compass, Sparkles, User } from "lucide-react";

const TABS = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/hotels", label: "Stays", Icon: BedDouble },
  { href: "/explore", label: "Explore", Icon: Compass },
  { href: "/plan", label: "Plan", Icon: Sparkles },
  { href: "/account", label: "Account", Icon: User },
];

// App-style bottom navigation, phones only. Floating controls (concierge,
// WhatsApp, etc.) are lifted above this bar on mobile via their own classes.
export default function MobileTabBar() {
  const pathname = usePathname() || "/";
  return (
    <nav className="sm:hidden print:hidden fixed bottom-0 inset-x-0 z-40 bg-page/95 backdrop-blur-md border-t border-line animate-slide-up" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex items-stretch justify-around h-14">
        {TABS.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={`flex flex-col items-center justify-center gap-0.5 flex-1 ${active ? "text-gold" : "text-ink-muted"}`}>
              <Icon size={19} />
              <span className="text-[9px] tracking-[0.08em] uppercase">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
