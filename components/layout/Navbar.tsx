"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import Logo from "@/components/ui/Logo";
import CurrencySelector from "@/components/ui/CurrencySelector";
import LanguageSelector from "@/components/ui/LanguageSelector";
import SearchOverlay from "@/components/layout/SearchOverlay";
import AccountMenu from "@/components/layout/AccountMenu";
import ThemeToggle from "@/components/ui/ThemeToggle";
import NavConverter from "@/components/layout/NavConverter";
import { useLanguage } from "@/components/providers/LanguageProvider";

type NavLink = { key?: string; label?: string; href: string };

// Consolidated primary nav — the links that always sit in the bar.
const PRIMARY_LINKS: NavLink[] = [
  { key: "common.destinations", href: "/packages" },
  { key: "common.stays",        href: "/hotels" },
  { key: "common.cruises",      href: "/cruises" },
  { key: "common.flights",      href: "/flights" },
  { key: "common.experiences",  href: "/experiences" },
  { key: "common.journal",      href: "/blog" },
  { label: "Trip Tools",        href: "/tools" },
];

// Secondary links — reached via the Account icon / mobile menu, plus the
// Plan Your Journey CTA. Kept out of the primary row so it never overflows.
const SECONDARY_LINKS: NavLink[] = [
  { key: "plan.title",      href: "/plan" },
  { label: "Visa assistance", href: "/visa" },
  { label: "Travel insurance", href: "/insurance" },
  { key: "common.myTrips",  href: "/trips" },
  { key: "account.account", href: "/account" },
];

const MOBILE_LINKS = [...PRIMARY_LINKS, ...SECONDARY_LINKS];

export default function Navbar() {
  const { t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const linksRef = useRef<HTMLDivElement>(null);
  const [linksOverflow, setLinksOverflow] = useState(false);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateArrows = () => {
    const el = linksRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };
  const scrollNav = (dir: 1 | -1) => linksRef.current?.scrollBy({ left: dir * 240, behavior: "smooth" });

  // Fallback only: if a very long language still doesn't fit even after
  // consolidation, the row stays scrollable with arrows rather than clipping.
  useEffect(() => {
    const el = linksRef.current;
    if (!el) return;
    const check = () => { setLinksOverflow(el.scrollWidth > el.clientWidth + 1); updateArrows(); };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [t]);

  // The navbar is a solid DARK band that sits ABOVE the hero map on every page.
  // Its contents are light (white wordmark + links), so `overHero` — which
  // drives the light-on-dark tone throughout — stays true; only the background
  // is a fixed dark band rather than the transparent-over-map bar it once was.
  const overHero = true;
  // One uniform size and weight for every language — no per-language bumps.
  const linkBase = "nav-underline text-[12px] font-normal tracking-[0.08em] uppercase transition-colors duration-200 py-2 whitespace-nowrap shrink-0 inline-block";
  const linkColor = overHero ? "text-white/90 hover:text-white" : "text-ink-muted hover:text-ink";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-vc-950/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
        <div className="flex items-center gap-x-4 lg:gap-x-6 min-h-20">

          <div className="flex shrink-0">
            <Logo size={overHero ? 26 : 24} tone={overHero ? "light" : "dark"} shimmer />
          </div>

          {/* Primary links — contained, scrollable as a fallback only. */}
          <div className="hidden lg:block relative min-w-0 flex-1">
            {canLeft && (
              <button type="button" aria-label="Scroll navigation left" onClick={() => scrollNav(-1)}
                className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-7 h-7 rounded-full shadow-sm ${overHero ? "bg-vc-950/70 text-white" : "bg-page text-ink border border-line"}`}>
                <ChevronLeft size={16} />
              </button>
            )}
            <div
              ref={linksRef}
              onScroll={updateArrows}
              className="overflow-x-auto scrollbar-none"
              style={linksOverflow && canRight ? {
                maskImage: "linear-gradient(to right, black 92%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to right, black 92%, transparent 100%)",
              } : undefined}
            >
              <div className="flex items-center gap-x-5 w-max pr-2">
                {PRIMARY_LINKS.map(l => (
                  <Link key={l.href} href={l.href} className={`${linkBase} ${linkColor}`}>{l.label ?? t(l.key ?? "")}</Link>
                ))}
              </div>
            </div>
            {canRight && (
              <button type="button" aria-label="Scroll navigation right" onClick={() => scrollNav(1)}
                className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-7 h-7 rounded-full shadow-sm ${overHero ? "bg-vc-950/70 text-white" : "bg-page text-ink border border-line"}`}>
                <ChevronRight size={16} />
              </button>
            )}
          </div>

          {/* Controls — search, account menu, language, currency, primary CTA. */}
          <div className="hidden lg:flex items-center gap-x-3 shrink-0">
            <SearchOverlay tone={overHero ? "light" : "dark"} />
            <AccountMenu tone={overHero ? "light" : "dark"} />
            <ThemeToggle tone={overHero ? "light" : "dark"} size={17} />
            <NavConverter tone={overHero ? "light" : "dark"} />
            <LanguageSelector tone={overHero ? "light" : "dark"} />
            <CurrencySelector tone={overHero ? "light" : "dark"} />
            <Link
              href="/plan"
              className={`text-[10px] font-medium tracking-[0.1em] uppercase px-4 py-2.5 rounded-sm border transition-all duration-200 whitespace-nowrap shrink-0 hover:scale-110 active:scale-95 ${
                overHero ? "border-white/70 text-white hover:bg-white hover:text-ink" : "bg-ink border-ink text-page hover:bg-ink/90"
              }`}
            >
              {t("plan.title")}
            </Link>
          </div>

          {/* Mobile/tablet — search + toggle + menu. Account is intentionally
              omitted here: it already lives in the bottom tab bar, so showing
              it at the top too would duplicate it. */}
          <div className="flex lg:hidden items-center gap-4 ml-auto">
            <ThemeToggle tone={overHero ? "light" : "dark"} size={20} />
            <SearchOverlay tone={overHero ? "light" : "dark"} triggerSize={20} />
            <button className={overHero ? "text-white" : "text-ink"} onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile/tablet menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-page border-t border-line px-6 py-8 space-y-5 animate-slide-down overflow-hidden">
          {MOBILE_LINKS.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}
              className="block text-base font-normal tracking-[0.1em] uppercase text-ink-muted hover:text-ink transition-colors duration-200 py-1.5 animate-slide-down"
            >
              <span className="nav-underline">{l.label ?? t(l.key ?? "")}</span>
            </Link>
          ))}
          <div className="py-1.5 flex items-center gap-5 animate-slide-down" style={{ animationDelay: `${MOBILE_LINKS.length * 50}ms`, animationFillMode: "both" }}>
            <LanguageSelector tone="dark" />
            <CurrencySelector tone="dark" />
          </div>
          <Link
            href="/plan"
            onClick={() => setMobileOpen(false)}
            style={{ animationDelay: `${(MOBILE_LINKS.length + 1) * 50}ms`, animationFillMode: "both" }}
            className="block mt-4 text-center text-sm font-medium tracking-[0.16em] uppercase bg-ink text-page py-3.5 rounded-sm transition-transform duration-200 hover:scale-105 active:scale-95 animate-slide-down"
          >
            {t("plan.title")}
          </Link>
        </div>
      )}
    </nav>
  );
}
