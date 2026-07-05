"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, Headset, X } from "lucide-react";
import Logo from "@/components/ui/Logo";
import CurrencySelector from "@/components/ui/CurrencySelector";
import LanguageSelector from "@/components/ui/LanguageSelector";
import SearchOverlay from "@/components/layout/SearchOverlay";
import AccountMenu from "@/components/layout/AccountMenu";
import ThemeToggle from "@/components/ui/ThemeToggle";
import NavConverter from "@/components/layout/NavConverter";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useContent, useContentList } from "@/components/providers/ContentProvider";

type NavLink = { key?: string; label?: string; href: string; cKey?: string };

// The primary destinations, shown large inside the menu.
const PRIMARY_LINKS: NavLink[] = [
  { key: "common.destinations", cKey: "nav.destinations", href: "/packages" },
  { key: "common.stays",        cKey: "nav.stays",        href: "/hotels" },
  { key: "common.cruises",      cKey: "nav.cruises",      href: "/cruises" },
  { key: "common.flights",      cKey: "nav.flights",      href: "/flights" },
  { key: "common.experiences",  cKey: "nav.experiences",  href: "/experiences" },
  { key: "common.journal",      cKey: "nav.journal",      href: "/blog" },
  { label: "Trip Tools", cKey: "nav.tripTools",           href: "/tools" },
];

// Supporting links, shown smaller beneath the primary ones.
const SECONDARY_LINKS: NavLink[] = [
  { label: "Voyages Reserve", href: "/membership#voyages-reserve" },
  { label: "Group booking", href: "/group" },
  { label: "Refer a friend", href: "/refer" },
  { label: "Visa assistance", href: "/visa" },
  { label: "Travel insurance", href: "/insurance" },
  { key: "common.myTrips",  href: "/trips" },
  { key: "account.account", href: "/account" },
];

export default function Navbar() {
  const { t } = useLanguage();
  const c = useContent();
  const navList = useContentList("list.nav");
  const [menuOpen, setMenuOpen] = useState(false);

  // A saved nav list replaces the defaults; otherwise use the shipped links with
  // their content/translation overrides.
  const primaryLinks: { href: string; label: string }[] = navList
    ? navList.map(x => ({ href: x.href || "#", label: x.label || "" }))
    : PRIMARY_LINKS.map(l => ({ href: l.href, label: c(l.cKey ?? "") || l.label || t(l.key ?? "") }));
  const secondaryLinks = SECONDARY_LINKS.map(l => ({ href: l.href, label: l.label || t(l.key ?? "") }));
  const planLabel = c("nav.planCta") || t("plan.title");

  // Lock background scroll + close on Escape while the menu is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [menuOpen]);

  const close = () => setMenuOpen(false);
  const ctaClass = "text-[10px] font-medium tracking-[0.14em] uppercase px-4 py-2.5 rounded-sm border border-white/70 text-white hover:bg-white hover:text-ink transition-all duration-200 whitespace-nowrap hover:scale-105 active:scale-95";

  let delay = 0; // staggered entrance for menu items

  return (
    <>
    <nav className="fixed top-0 left-0 right-0 z-50 bg-vc-950/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between gap-2 min-h-20">
          {/* Wordmark */}
          <Link href="/" onClick={close} className="flex shrink-0" aria-label="Voyages & Co. home">
            <Logo size={26} tone="light" shimmer />
          </Link>

          {/* Minimal controls — single CTA, search, account (desktop), menu */}
          <div className="flex items-center gap-2.5 sm:gap-5 shrink-0">
            <Link href="/plan" onClick={close} className={`hidden sm:inline-flex ${ctaClass}`}>{planLabel}</Link>
            <div className="flex items-center gap-2 sm:gap-4">
              <LanguageSelector tone="light" />
              <CurrencySelector tone="light" />
            </div>
            <div className="hidden lg:block"><ThemeToggle tone="light" size={19} /></div>
            <div className="hidden lg:block"><NavConverter tone="light" /></div>
            <SearchOverlay tone="light" triggerSize={20} />
            <div className="hidden lg:block"><AccountMenu tone="light" /></div>
            <button
              type="button"
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              title={menuOpen ? "Close" : "Menu"}
              aria-expanded={menuOpen}
              className="w-7 h-7 flex items-center justify-center text-white transition-transform duration-200 hover:scale-110 active:scale-95"
            >
              {menuOpen ? (
                <X size={22} />
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" aria-hidden="true">
                  <circle cx="7" cy="8.5" r="2.5" />
                  <line x1="10.5" y1="8.5" x2="20" y2="8.5" />
                  <line x1="4" y1="15.5" x2="13.5" y2="15.5" />
                  <circle cx="17" cy="15.5" r="2.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>

    {/* Menu rendered OUTSIDE <nav> — the bar's backdrop-filter would otherwise
        make this fixed overlay be contained by the 80px bar (a CSS gotcha),
        collapsing it to zero height. */}
    {menuOpen && (
        <div className="fixed inset-x-0 top-20 bottom-0 z-[45]">
          <div className="absolute inset-0 bg-vc-950/95 backdrop-blur-xl animate-fade-in" onClick={close} />
          <div className="relative h-full overflow-y-auto overscroll-contain">
            <div className="max-w-[1100px] mx-auto px-6 lg:px-12 py-10 sm:py-14">
              <p className="text-[11px] tracking-[0.34em] uppercase text-gold mb-8 animate-fade-in">Explore</p>

              {/* Primary destinations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-14">
                {primaryLinks.map(l => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={close}
                    style={{ animationDelay: `${(delay++) * 45}ms`, animationFillMode: "both" }}
                    className="group flex items-center justify-between py-3.5 border-b border-white/10 animate-fade-in"
                  >
                    <span className="font-serif text-2xl sm:text-[28px] font-light text-white/90 group-hover:text-white transition-colors">{l.label}</span>
                    <ArrowUpRight size={18} className="text-gold opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </Link>
                ))}
              </div>

              {/* Plan CTA + supporting links */}
              <div className="mt-10 flex flex-col gap-8">
                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href="/plan"
                    onClick={close}
                    style={{ animationDelay: `${(delay++) * 45}ms`, animationFillMode: "both" }}
                    className="inline-flex items-center gap-2 bg-white text-ink px-7 py-3.5 rounded-sm text-xs tracking-[0.16em] uppercase font-medium hover:bg-white/90 transition-all hover:scale-105 active:scale-95 animate-fade-in"
                  >
                    {planLabel} <ArrowUpRight size={15} />
                  </Link>
                  <Link
                    href="/support"
                    onClick={close}
                    style={{ animationDelay: `${(delay++) * 45}ms`, animationFillMode: "both" }}
                    className="inline-flex items-center gap-2 border border-gold/60 text-gold px-6 py-3.5 rounded-sm text-xs tracking-[0.16em] uppercase font-medium hover:bg-gold hover:text-vc-950 transition-all animate-fade-in"
                  >
                    <Headset size={15} /> Support
                  </Link>
                </div>

                <div className="flex flex-wrap gap-x-8 gap-y-3">
                  {secondaryLinks.map(l => {
                    const premium = l.href.includes("voyages-reserve");
                    return (
                      <Link
                        key={l.href}
                        href={l.href}
                        onClick={close}
                        style={{ animationDelay: `${(delay++) * 45}ms`, animationFillMode: "both" }}
                        className={`text-xs tracking-[0.14em] uppercase transition-colors animate-fade-in ${premium ? "text-gold hover:text-gold/80" : "text-white/55 hover:text-white"}`}
                      >
                        {l.label}
                      </Link>
                    );
                  })}
                </div>

                {/* Theme toggle in the menu — phones only (it's on the bar for desktop). */}
                <div className="lg:hidden flex items-center gap-6 pt-7 border-t border-white/10">
                  <ThemeToggle tone="light" size={18} showLabel />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
