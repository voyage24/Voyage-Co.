"use client";

import { useState, useMemo, useEffect } from "react";
import { SlidersHorizontal, X, Search } from "lucide-react";
import HotelCard from "@/components/cards/HotelCard";
import { HOTELS } from "@/lib/mock-data";
import { useLanguage } from "@/components/providers/LanguageProvider";

const AMENITY_FILTERS = ["Pool", "Spa", "Gym", "Restaurant", "Bar", "Private Beach", "Butler", "Yoga"];
const STAR_OPTIONS = [5, 4, 3];
const MAX_PRICE = 200000;

const REGIONS = ["All", "India", "Middle East", "Southeast Asia", "Maldives & Indian Ocean", "Bhutan & Himalayas", "East Asia & Pacific", "Africa", "Europe", "The Americas"];
const CATEGORIES = ["All", "heritage", "urban", "resort", "wellness", "safari", "boutique"];

export default function HotelsPage() {
  const { t } = useLanguage();
  const [sortBy, setSortBy] = useState("Top rated");
  const [minStars, setMinStars] = useState(0);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [showFilters, setShowFilters] = useState(false);
  const [activeRegion, setActiveRegion] = useState("All");
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const toggleAmenity = (a: string) =>
    setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);

  // Pre-fill from URL search params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const city = params.get("city");
    const region = params.get("region");
    if (city) setSearchTerm(city);
    if (region) {
      const found = REGIONS.find(r => r.toLowerCase() === region.toLowerCase());
      if (found) setActiveRegion(found);
    }
  }, []);

  const filtered = useMemo(() => HOTELS
    .filter(h => {
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        if (!h.name.toLowerCase().includes(s) && !h.city.toLowerCase().includes(s) && !h.country.toLowerCase().includes(s) && !h.region.toLowerCase().includes(s)) return false;
      }
      if (activeRegion !== "All" && h.region !== activeRegion) return false;
      if (activeCategory !== "All" && h.category !== activeCategory) return false;
      if (h.stars < minStars) return false;
      if (amenities.length > 0 && !amenities.every(a => h.amenities.some(ha => ha.toLowerCase().includes(a.toLowerCase())))) return false;
      if (maxPrice < MAX_PRICE && h.pricePerNight > maxPrice) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "Top rated") return b.rating - a.rating;
      if (sortBy === "Price: Low") return a.pricePerNight - b.pricePerNight;
      if (sortBy === "Price: High") return b.pricePerNight - a.pricePerNight;
      return 0;
    }), [sortBy, minStars, amenities, maxPrice, activeRegion, activeCategory, searchTerm]);

  const headingText = searchTerm || (activeRegion === "All" ? "Worldwide" : activeRegion);

  const FilterPanel = () => (
    <aside className="bg-panel rounded-2xl border border-line shadow-card p-6 space-y-7">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-light text-ink">{t("listing.refine")}</h3>
        <button
          onClick={() => { setMinStars(0); setAmenities([]); setMaxPrice(MAX_PRICE); setActiveCategory("All"); }}
          className="text-[11px] tracking-[0.12em] uppercase text-gold hover:underline"
        >
          {t("listing.reset")}
        </button>
      </div>

      <div>
        <p className="text-[11px] tracking-[0.14em] uppercase text-ink-faint mb-3">{t("hotelsPage.pricePerNight")}</p>
        <input type="range" min={3000} max={MAX_PRICE} step={5000} value={maxPrice}
          onChange={e => setMaxPrice(+e.target.value)} className="w-full accent-gold" />
        <div className="flex justify-between text-xs text-ink-muted mt-1 font-light">
          <span>₹3,000</span>
          <span className="font-medium text-gold">
            {maxPrice >= MAX_PRICE ? t("hotelsPage.any") : `₹${maxPrice.toLocaleString("en-IN")}`}
          </span>
          <span>₹2L+</span>
        </div>
      </div>

      <div>
        <p className="text-[11px] tracking-[0.14em] uppercase text-ink-faint mb-3">{t("hotelsPage.starRating")}</p>
        <div className="flex gap-2 flex-wrap">
          {STAR_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setMinStars(minStars === s ? 0 : s)}
              className={`px-3 py-1.5 rounded-sm text-xs font-normal border transition-colors ${minStars === s ? "bg-ink border-ink text-page" : "border-line text-ink-muted hover:border-ink/40"}`}
            >
              {s}★ +
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] tracking-[0.14em] uppercase text-ink-faint mb-3">{t("experienceSearch.category")}</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-normal border capitalize transition-colors ${activeCategory === c ? "bg-ink border-ink text-page" : "border-line text-ink-muted hover:border-ink/40"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] tracking-[0.14em] uppercase text-ink-faint mb-3">{t("hotelsPage.amenities")}</p>
        <div className="space-y-2.5">
          {AMENITY_FILTERS.map(a => (
            <label key={a} className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={amenities.includes(a)} onChange={() => toggleAmenity(a)} className="accent-gold w-4 h-4" />
              <span className="text-sm text-ink-muted font-light">{a}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">

      {/* Search bar */}
      <div className="bg-panel-raised rounded-xl shadow-card border border-line p-4 mb-8 flex items-center gap-3">
        <Search size={18} className="text-ink-faint shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder={t("hotelsPage.searchPlaceholder")}
          className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none font-light"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm("")} className="shrink-0 text-ink-faint hover:text-ink">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Title */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] tracking-[0.28em] uppercase text-gold mb-2">{t("searchTabs.hotels")}</p>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-ink">
            {t("hotelsPage.titlePrefix")} <span className="italic text-gold">{headingText}</span>
          </h1>
          <p className="text-sm text-ink-muted mt-1 font-light">{filtered.length} {filtered.length === 1 ? t("hotelsPage.property") : t("hotelsPage.properties")} {t("hotelsPage.available")}</p>
        </div>
        <button
          onClick={() => setShowFilters(true)}
          className="lg:hidden flex items-center gap-2 px-4 py-2 border border-line rounded-sm text-xs font-medium tracking-wide uppercase text-ink-muted"
        >
          <SlidersHorizontal size={15} /> {t("listing.refine")}
        </button>
      </div>

      {/* Region tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {REGIONS.map(r => (
          <button
            key={r}
            onClick={() => { setActiveRegion(r); setSearchTerm(""); }}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-normal tracking-[0.08em] border transition-colors whitespace-nowrap ${activeRegion === r && !searchTerm ? "bg-ink border-ink text-page" : "border-line text-ink-muted hover:border-ink/40 bg-panel"}`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="flex gap-8">
        <div className="hidden lg:block w-64 shrink-0">
          <FilterPanel />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-5 gap-3">
            <p className="text-sm text-ink-muted font-light whitespace-nowrap shrink-0">{filtered.length} {t("hotelsPage.found")}</p>
            <div className="flex gap-2 overflow-x-auto scrollbar-none min-w-0">
              {(["Top rated", "Price: Low", "Price: High"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-normal tracking-wide transition-colors whitespace-nowrap shrink-0 ${sortBy === s ? "bg-ink text-page" : "bg-panel-soft text-ink-muted hover:text-ink"}`}
                >
                  {s === "Top rated" ? t("hotelsPage.topRated") : s === "Price: Low" ? t("listing.priceLow") : t("listing.priceHigh")}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            {filtered.length > 0 ? (
              filtered.map((hotel, i) => <HotelCard key={hotel.id} hotel={hotel} priority={i === 0} />)
            ) : (
              <div className="text-center py-20">
                <p className="font-serif text-2xl font-light text-ink mb-2">{t("hotelsPage.noMatch")}</p>
                <button
                  onClick={() => { setMinStars(0); setAmenities([]); setMaxPrice(MAX_PRICE); setActiveCategory("All"); setActiveRegion("All"); setSearchTerm(""); }}
                  className="mt-3 text-xs tracking-[0.12em] uppercase text-gold hover:underline"
                >
                  {t("hotelsPage.clearAll")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-vc-950/60 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-page overflow-y-auto p-5">
            <div className="flex items-center justify-end mb-4">
              <button onClick={() => setShowFilters(false)} className="text-ink-muted"><X size={20} /></button>
            </div>
            <FilterPanel />
            <button onClick={() => setShowFilters(false)} className="w-full mt-6 py-3 bg-ink text-page text-xs font-medium tracking-[0.14em] uppercase rounded-sm">
              {t("listing.showResultsPrefix")} {filtered.length} {t("listing.showResultsSuffix")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
