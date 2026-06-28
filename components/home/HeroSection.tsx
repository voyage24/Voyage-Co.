"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import SearchWidget, { type TabId } from "@/components/search/SearchWidget";
import DestinationMap from "@/components/home/DestinationMap";

// The Flights tab (DestinationMap, the default) ships in the initial bundle;
// the other tabs' maps are loaded only when that tab is opened, keeping the
// homepage's initial JS light — especially on phones. A plain dark panel
// stands in for the split-second before each map chunk arrives.
const mapLoading = () => <div className="absolute inset-0 bg-vc-950" />;
const HotelMapBackground = dynamic(() => import("@/components/home/HotelMapBackground"), { ssr: false, loading: mapLoading });
const CruiseMapBackground = dynamic(() => import("@/components/home/CruiseMapBackground"), { ssr: false, loading: mapLoading });
const RailMapBackground = dynamic(() => import("@/components/home/RailMapBackground"), { ssr: false, loading: mapLoading });
const PackageMapBackground = dynamic(() => import("@/components/home/PackageMapBackground"), { ssr: false, loading: mapLoading });
const ExperienceMapBackground = dynamic(() => import("@/components/home/ExperienceMapBackground"), { ssr: false, loading: mapLoading });
import { CITIES } from "@/lib/mock-data";
import type { City, Hotel, Cruise, Train, Package, Experience } from "@/lib/types";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useSetting } from "@/components/providers/SettingsProvider";
import { useIsMobile } from "@/lib/useIsMobile";

// Journeys featured in the hero background for their respective search
// tabs. Luxury Stays and Cruises have no fixed list — Cruises cycles
// through every voyage in the catalogue now that all of them have full
// port-of-call coordinates; Luxury Stays shows whichever city the
// traveller actually picks from the search dropdown.
const FEATURED_TRAIN_IDS = ["t1", "t3", "t8"];

// Tabs that have their own dedicated headline copy (see lib/i18n/dictionaries.ts).
// "flights" intentionally falls back to the original generic hero.* keys.
const TAB_CONTENT_KEY: Record<string, string> = {
  hotels: "hotels",
  cruises: "cruises",
  trains: "trains",
  experiences: "experiences",
  packages: "packages",
};

// Primary quick-link CTA per search tab — label and destination both follow
// whichever tab is active, instead of always pointing at the generic
// journeys/stays pair regardless of what's actually selected.
const TAB_EXPLORE_LINK: Record<TabId, { labelKey: string; href: string }> = {
  flights:     { labelKey: "hero.exploreFlights",         href: "/flights" },
  hotels:      { labelKey: "hero.exploreStays",            href: "/hotels" },
  cruises:     { labelKey: "hero.exploreCruises",          href: "/cruises" },
  trains:      { labelKey: "hero.exploreRailJourneys",     href: "/trains" },
  experiences: { labelKey: "hero.exploreExperiences",      href: "/experiences" },
  packages:    { labelKey: "hero.exploreBespokeJourneys",  href: "/packages" },
};

export default function HeroSection({
  hotels, cruises, trains, packages, experiences,
}: {
  hotels: Hotel[];
  cruises: Cruise[];
  trains: Train[];
  packages: Package[];
  experiences: Experience[];
}) {
  const { t } = useLanguage();
  const [from, setFrom] = useState<City | null>(CITIES.find(c => c.code === "DEL") ?? null);
  const [to, setTo]     = useState<City | null>(CITIES.find(c => c.code === "DXB") ?? null);
  const [activeTab, setActiveTab] = useState<TabId>("flights");
  const [hotelCity, setHotelCity] = useState("");
  // Hides the headline while the traveller is actually pointing at the map,
  // so the banner text never sits on top of the thing they're trying to
  // click — and brings it back as soon as they move to the search form.
  const [mapHoverRaw, setMapHoverRaw] = useState(false);
  const [mapHover, setMapHover] = useState(false);
  useEffect(() => {
    if (!mapHoverRaw) {
      setMapHover(false);
      return;
    }
    // Debounce the hide: switching search tabs changes the form's height,
    // which can momentarily shift the layout under a stationary cursor and
    // make the browser briefly report it as hovering the background map.
    // Requiring a short sustained hover avoids that flicker hiding the
    // headline when someone's just clicking between tabs.
    const timer = setTimeout(() => setMapHover(true), 200);
    return () => clearTimeout(timer);
  }, [mapHoverRaw]);

  // The headline auto-fades a few seconds after it appears (or after
  // switching tabs) so it never sits on top of the map indefinitely —
  // hovering it (or moving away from the map) brings it straight back.
  const [autoHide, setAutoHide] = useState(false);
  const autoHideTimer = useRef<ReturnType<typeof setTimeout>>();
  const scheduleAutoHide = () => {
    clearTimeout(autoHideTimer.current);
    setAutoHide(false);
    autoHideTimer.current = setTimeout(() => setAutoHide(true), 4500);
  };
  useEffect(() => {
    scheduleAutoHide();
    return () => clearTimeout(autoHideTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);
  // On phones the headline sits below the map (not over it), so it must stay
  // put — the hover/auto-fade behaviour is desktop-only.
  const isMobile = useIsMobile();
  const headlineHidden = !isMobile && (mapHover || autoHide);

  // Each search tab gets its own headline copy instead of repeating the
  // same generic text regardless of what the traveller is browsing.
  const contentKey = TAB_CONTENT_KEY[activeTab];
  const tx = (suffix: string) => t(contentKey ? `hero.${contentKey}.${suffix}` : `hero.${suffix}`);

  // Admin-overridable hero copy (blank = use the built-in translated copy).
  const customHeadline = useSetting("hero.headline");
  const customSubtext = useSetting("hero.subtext");
  const hotelCities = useMemo(() => Array.from(new Set(hotels.map(h => h.city))).sort(), [hotels]);

  const featuredTrains = useMemo(
    () => FEATURED_TRAIN_IDS
      .map(id => trains.find(t => t.id === id))
      .filter((t): t is NonNullable<typeof t> => !!t),
    [trains]
  );

  return (
    <section className="relative bg-vc-950 sm:bg-transparent pt-20 sm:pt-0 flex flex-col overflow-hidden sm:min-h-screen">
      {/* Hero background — swaps with the active search tab. The Flights tab
          (default) shows the interactive destination map; Luxury Stays,
          Cruises, Rail Journeys, Bespoke Journeys and Experiences all show
          interactive maps plotting their own featured properties/voyages/
          itineraries/experiences, instead of static photos. */}
      <div
        className={`relative w-full ${activeTab === "trains" ? "aspect-[4/3]" : "aspect-[16/9]"} sm:aspect-auto sm:absolute sm:inset-0`}
        onMouseMove={e => {
          const rect = e.currentTarget.getBoundingClientRect();
          const isLeftHalf = e.clientX - rect.left < rect.width / 2;
          setMapHoverRaw(isLeftHalf);
        }}
        onMouseLeave={() => setMapHoverRaw(false)}
      >
        {activeTab === "hotels" ? (
          <HotelMapBackground hotels={hotels} city={hotelCity} />
        ) : activeTab === "cruises" ? (
          <CruiseMapBackground cruises={cruises} />
        ) : activeTab === "trains" ? (
          <RailMapBackground trains={featuredTrains} />
        ) : activeTab === "packages" ? (
          <PackageMapBackground packages={packages} />
        ) : activeTab === "experiences" ? (
          <ExperienceMapBackground experiences={experiences} />
        ) : (
          <DestinationMap from={from} to={to} onSelectDestination={setTo} />
        )}
      </div>

      {/* Soft vignette for text legibility over the background. Desktop only —
          on mobile the map sits in its own block with the text below it on a
          solid dark background, so there's nothing to dim. */}
      <div className="hidden sm:block absolute inset-0 bg-gradient-to-t from-vc-950/85 via-vc-950/35 to-vc-950/25 pointer-events-none" />

      {/* Top content — headline & CTA. pointer-events-none on the empty
          wrapper area so it doesn't block clicks (e.g. slide indicators) on
          the background behind the right-hand side of the hero; re-enabled
          on the actual interactive content. Fades out while hovering the
          map, and automatically a few seconds after appearing, so the text
          never sits on top of the map indefinitely — moving onto it (or
          away from the map) brings it straight back. */}
      <div className="relative flex-none sm:flex-1 flex items-center pointer-events-none">
        <div className="w-full max-w-[1500px] mx-auto px-6 lg:px-12 pt-6 pb-3 sm:pt-24 sm:pb-4">
          <div
            key={activeTab}
            className="max-w-2xl animate-fade-up transition-opacity duration-300"
            style={{ opacity: headlineHidden ? 0 : 1, pointerEvents: headlineHidden ? "none" : "auto" }}
            onMouseEnter={() => { setMapHoverRaw(false); setMapHover(false); scheduleAutoHide(); }}
          >
            <p className="text-[11px] sm:text-[13px] tracking-[0.28em] uppercase text-white/80 mb-2 sm:mb-4">
              {tx("eyebrow")}
            </p>
            <h1 className="font-serif font-light text-white text-3xl sm:text-6xl lg:text-7xl leading-[1.1] sm:leading-[1.04] mb-3 sm:mb-5">
              {customHeadline ? customHeadline : <>{tx("headline1")}<br />{tx("headline2")}</>}
            </h1>
            <p className="text-white/85 text-sm sm:text-xl max-w-lg leading-relaxed line-clamp-3 sm:line-clamp-none">
              {customSubtext || tx("paragraph")}
            </p>
          </div>
        </div>
      </div>

      {/* Quick links — kept out of the fading headline block and given their
          own compact, always-visible row so they stay reachable instead of
          disappearing while the map is in focus. */}
      <div className="relative w-full max-w-[1500px] mx-auto px-6 lg:px-12 pb-3">
        <div className="flex flex-wrap gap-3">
          <Link
            href={TAB_EXPLORE_LINK[activeTab].href}
            className="inline-flex items-center justify-center px-5 py-2 text-[11px] tracking-[0.16em] uppercase font-medium bg-white text-ink hover:bg-white/90 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            {t(TAB_EXPLORE_LINK[activeTab].labelKey)}
          </Link>
          {activeTab === "hotels" && (
            <Link
              href="/hotels"
              className="inline-flex items-center justify-center px-5 py-2 text-[11px] tracking-[0.16em] uppercase font-medium border border-white/70 text-white hover:bg-white hover:text-ink transition-all duration-200 hover:scale-105 active:scale-95"
            >
              {t("hero.browseStays")}
            </Link>
          )}
        </div>
      </div>

      {/* Search widget — anchored to the bottom of the hero. Its Flights tab
          drives the map above via onFlightRouteChange; switching tabs drives
          which background is shown. */}
      <div
        className="relative w-full max-w-[1500px] mx-auto px-6 lg:px-12 pb-0"
        onMouseEnter={() => { setMapHoverRaw(false); setMapHover(false); }}
        onMouseMove={() => { setMapHoverRaw(false); setMapHover(false); }}
      >
        <SearchWidget
          flightFrom={from}
          flightTo={to}
          onFlightRouteChange={(f, t) => { setFrom(f); setTo(t); }}
          activeTab={activeTab}
          onActiveTabChange={setActiveTab}
          hotelCity={hotelCity}
          onHotelCitySelect={setHotelCity}
          hotelCities={hotelCities}
        />
      </div>

      {/* Scroll cue below search */}
      <div className="relative flex flex-col items-center gap-1.5 text-white/50 py-3">
        <span className="text-[9px] tracking-[0.3em] uppercase">{t("hero.scroll")}</span>
        <span className="w-px h-5 bg-white/30" />
      </div>
    </section>
  );
}
