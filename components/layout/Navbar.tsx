"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import Logo from "@/components/ui/Logo";
import CurrencySelector from "@/components/ui/CurrencySelector";
import LanguageSelector from "@/components/ui/LanguageSelector";
import { useLanguage } from "@/components/providers/LanguageProvider";

const LEFT_LINKS = [
  { key: "common.destinations", href: "/packages" },
  { key: "common.stays",        href: "/hotels" },
  { key: "common.cruises",      href: "/cruises" },
  { key: "common.flights",      href: "/flights" },
  { key: "common.experiences",  href: "/experiences" },
];

const RIGHT_LINKS = [
  { key: "plan.title", href: "/plan" },
  { key: "common.journal",  href: "/blog" },
  { key: "common.myTrips", href: "/trips" },
  { key: "account.account", href: "/account" },
];

const ALL_LINKS = [...LEFT_LINKS, ...RIGHT_LINKS];

export default function Navbar() {
  const { t, language } = useLanguage();
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

  // Detects when the nav links don't fit their available space (common with
  // longer translations) so a fade can signal "scroll for more" instead of
  // the row just clipping abruptly at the edge next to the language/currency
  // controls, which otherwise reads as the text colliding with them.
  useEffect(() => {
    const el = linksRef.current;
    if (!el) return;
    const check = () => { setLinksOverflow(el.scrollWidth > el.clientWidth + 1); updateArrows(); };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [t, language]);

  // Let a vertical mouse wheel scroll the nav links horizontally when they
  // overflow — so desktop users without a trackpad can still reach the
  // links past the fade (My Trips, Account, …) in any language.
  useEffect(() => {
    const el = linksRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return;
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        el.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [t, language]);

  const overHero = pathname === "/" && !scrolled;
  // Smaller, uniform size for every language — chosen so even the longest
  // translations (Vietnamese, Filipino, Greek) fit on a single line at xl+
  // without needing the scroll/fade fallback below. Per-language bumps
  // layered on top as requested, since some scripts/labels read smaller
  // than Latin text at the same pixel size and have room to spare.
  const NAV_FONT_SIZE: Record<string, string> = {
    he: "text-[12px]",
    ja: "text-[14px]",
    en: "text-[15px]", ko: "text-[15px]", fa: "text-[15px]", th: "text-[15px]",
    ur: "text-[15px]", ar: "text-[15px]", mr: "text-[15px]", gu: "text-[15px]",
    hi: "text-[15px]", bn: "text-[15px]", zh: "text-[15px]",
  };
  const linkBase = `${NAV_FONT_SIZE[language.code] ?? "text-[11px]"} font-normal tracking-[0.08em] uppercase transition-all duration-200 py-2 whitespace-nowrap shrink-0 inline-block origin-left hover:scale-110 active:scale-95`;
  const linkColor = overHero ? "text-white/90 hover:text-white" : "text-ink-muted hover:text-ink";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      overHero ? "bg-transparent py-6" : "bg-page/95 backdrop-blur-md border-b border-line py-0"
    }`}>
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
        <div className={`flex items-center gap-x-4 lg:gap-x-6 transition-all duration-500 ${overHero ? "min-h-16" : "min-h-20"}`}>

          {/* Wordmark — fixed at the start of the bar. Its position never
              depends on balancing the width of nav links against each other,
              so it can never be thrown off by longer translated labels. */}
          <div className="flex shrink-0">
            <Logo size={overHero ? 26 : 24} tone={overHero ? "light" : "dark"} />
          </div>

          {/* All nav links — horizontally scrollable (no visible native
              scrollbar) instead of wrapping, so long translated labels never
              collide with the always-visible language/currency/reserve
              controls. When they don't all fit, a fade on the trailing edge
              signals "scroll for more" instead of the row clipping abruptly
              right next to the controls, which otherwise reads as the text
              colliding with them. Only attempted at xl+ (1280px) — below
              that, even "lg" desktop widths are too tight for longer
              translations (Vietnamese, Filipino, Greek), so the menu falls
              back to the always-correct stacked mobile layout. */}
          <div className="hidden xl:block relative min-w-0 flex-1">
            {/* Left arrow — appears once the row has been scrolled. */}
            {canLeft && (
              <button
                type="button"
                aria-label="Scroll navigation left"
                onClick={() => scrollNav(-1)}
                className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-7 h-7 rounded-full shadow-sm ${overHero ? "bg-vc-950/70 text-white" : "bg-page text-ink border border-line"}`}
              >
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
              <div className="flex items-center gap-x-4 w-max pr-2">
                {ALL_LINKS.map(l => (
                  <Link key={l.href} href={l.href} className={`${linkBase} ${linkColor}`}>{t(l.key)}</Link>
                ))}
              </div>
            </div>
            {/* Right arrow — appears whenever more links remain off-screen. */}
            {canRight && (
              <button
                type="button"
                aria-label="Scroll navigation right"
                onClick={() => scrollNav(1)}
                className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-7 h-7 rounded-full shadow-sm ${overHero ? "bg-vc-950/70 text-white" : "bg-page text-ink border border-line"}`}
              >
                <ChevronRight size={16} />
              </button>
            )}
          </div>

          {/* Language/currency/reserve — pinned to the end, never compressed
              or scrolled out of view regardless of how much nav link space
              translations need. (No ml-auto: it conflicts with the links'
              flex-1 and previously let overflowing links slip behind these.) */}
          <div className="hidden xl:flex items-center gap-x-3 shrink-0">
            <LanguageSelector tone={overHero ? "light" : "dark"} />
            <CurrencySelector tone={overHero ? "light" : "dark"} />
            <Link
              href="/signup"
              className={`text-[10px] font-medium tracking-[0.1em] uppercase px-4 py-2.5 rounded-sm border transition-all duration-200 whitespace-nowrap shrink-0 hover:scale-110 active:scale-95 ${
                overHero
                  ? "border-white/70 text-white hover:bg-white hover:text-ink"
                  : "bg-ink border-ink text-page hover:bg-ink/90"
              }`}
            >
              {t("common.reserve")}
            </Link>
          </div>

          {/* Mobile/tablet toggle — covers everything below xl now, since
              that's the range where translated nav text was colliding. */}
          <div className="flex xl:hidden justify-end ml-auto">
            <button
              className={overHero ? "text-white" : "text-ink"}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile/tablet menu */}
      {mobileOpen && (
        <div className="xl:hidden bg-page border-t border-line px-6 py-8 space-y-5 animate-slide-down">
          {ALL_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="block text-base font-normal tracking-[0.1em] uppercase text-ink-muted hover:text-ink transition-all duration-200 py-1.5 origin-left hover:scale-105 active:scale-95"
            >
              {t(l.key)}
            </Link>
          ))}
          <div className="py-1.5 flex items-center gap-5">
            <LanguageSelector tone="dark" />
            <CurrencySelector tone="dark" />
          </div>
          <Link
            href="/signup"
            onClick={() => setMobileOpen(false)}
            className="block mt-4 text-center text-sm font-medium tracking-[0.16em] uppercase bg-ink text-page py-3.5 rounded-sm transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            {t("common.reserve")}
          </Link>
        </div>
      )}
    </nav>
  );
}
