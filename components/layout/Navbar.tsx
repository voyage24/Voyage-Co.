"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronLeft, ChevronRight, User } from "lucide-react";
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
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const overHero = pathname === "/" && !scrolled;
  // One uniform size and weight for every language — no per-language bumps.
  const linkBase = "text-[12px] font-normal tracking-[0.08em] uppercase transition-all duration-200 py-2 whitespace-nowrap shrink-0 inline-block origin-left hover:scale-110 active:scale-95";
  const linkColor = "text-ink-muted hover:text-ink";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      overHero ? "bg-transparent py-6" : "bg-page/95 backdrop-blur-md border-b border-line py-0"
    }`}>
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
        <div className={`flex items-center gap-x-4 lg:gap-x-6 transition-all duration-500 ${overHero ? "min-h-16" : "min-h-20"}`}>

          <div className="flex shrink-0">
            <Logo size={overHero ? 26 : 24} tone="dark" shimmer />
          </div>

          {/* Primary links — contained, scrollable as a fallback only. */}
          <div className="hidden lg:block relative min-w-0 flex-1">
            {canLeft && (
              <button type="button" aria-label="Scroll navigation left" onClick={() => scrollNav(-1)}
                className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-7 h-7 rounded-full shadow-sm bg-page text-ink border border-line`}>
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
                className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-7 h-7 rounded-full shadow-sm bg-page text-ink border border-line`}>
                <ChevronRight size={16} />
              </button>
            )}
          </div>

          {/* Controls — search, account menu, language, currency, primary CTA. */}
          <div className="hidden lg:flex items-center gap-x-3 shrink-0">
            <SearchOverlay tone="dark" />
            <AccountMenu tone="dark" />
            <ThemeToggle tone="dark" size={17} />
            <NavConverter tone="dark" />
            <LanguageSelector tone="dark" />
            <CurrencySelector tone="dark" />
            <Link
              href="/plan"
              className="text-[10px] font-bold tracking-[0.1em] uppercase px-5 py-2.5 rounded-full border bg-[#eab308] border-[#eab308] text-black hover:bg-[#d69e07] transition-all duration-200 whitespace-nowrap shrink-0 hover:scale-110 active:scale-95"
            >
              {t("plan.title")}
            </Link>
          </div>

          {/* Mobile/tablet — search + account + toggle */}
          <div className="flex lg:hidden items-center gap-4 ml-auto">
            <ThemeToggle tone="dark" size={20} />
            <SearchOverlay tone="dark" triggerSize={20} />
            <Link href="/account" aria-label={t("account.account")} className="inline-flex items-center justify-center leading-none transition-all duration-200 hover:scale-110 active:scale-95 text-ink-muted hover:text-ink">
              <User size={20} />
            </Link>
            <button className="text-ink" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
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
              className="block text-base font-normal tracking-[0.1em] uppercase text-ink-muted hover:text-ink transition-all duration-200 py-1.5 origin-left hover:scale-105 active:scale-95 animate-slide-down"
            >
              {l.label ?? t(l.key ?? "")}
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
