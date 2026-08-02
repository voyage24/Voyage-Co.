import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowLeftRight, Plane } from "lucide-react";
import { getDestinations, type Destination } from "@/lib/destinations";
import { getCountryMeta } from "@/lib/country-meta";
import { COUNTRY_CENTROIDS } from "@/lib/geo";
import { haversineKm } from "@/lib/carbon";
import { safeQuery } from "@/lib/safe-query";
import BestTimeToVisit from "@/components/products/BestTimeToVisit";
import SeasonalPriceIndicator from "@/components/products/SeasonalPriceIndicator";
import TypicalCosts from "@/components/products/TypicalCosts";
import TippingGuide from "@/components/products/TippingGuide";
import ConnectivityGuide from "@/components/products/ConnectivityGuide";
import HealthSafety from "@/components/products/HealthSafety";
import GettingAround from "@/components/products/GettingAround";
import DestinationWeather from "@/components/ui/DestinationWeather";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Compare Destinations — Voyages & Co.",
  description: "Compare two destinations side by side — climate, typical costs, currency, connectivity and more, before you choose.",
};

// A rough India gateway point (Delhi) — this gives only a ballpark great-circle
// flight estimate, not a real fare/route lookup (there's no flight-search
// integration on this comparison).
const DEL: [number, number] = [28.5562, 77.1];

function flightEstimate(country: string): string | null {
  const c = COUNTRY_CENTROIDS[country];
  if (!c) return null;
  const km = haversineKm(DEL[0], DEL[1], c[0], c[1]);
  const hours = km / 830 + 1; // cruise speed + a rough taxi/climb buffer
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `~${h}h ${m}m from Delhi`;
}

export default async function CompareDestinationsPage({ searchParams }: { searchParams: { a?: string; b?: string } }) {
  const destinations = await safeQuery(() => getDestinations(), []);

  if (destinations.length < 2) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-32 pb-20 text-center">
        <p className="text-ink-muted font-light">Need at least two destinations published to compare.</p>
      </div>
    );
  }

  const bySlug = (slug?: string) => destinations.find(d => d.slug === slug);
  const a = bySlug(searchParams.a) || destinations[0];
  const b = bySlug(searchParams.b) || destinations.find(d => d.slug !== a.slug) || destinations[1];
  const pair: Destination[] = [a, b];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-20">
      <div className="text-center mb-10">
        <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-2">Compare</p>
        <h1 className="font-serif text-3xl sm:text-4xl font-light text-ink">Two destinations, side by side</h1>
        <p className="text-ink-muted font-light mt-2 max-w-xl mx-auto">Climate, typical costs, currency and more — a quick read before you choose.</p>
      </div>

      <form method="get" className="flex flex-col sm:flex-row items-center gap-3 justify-center mb-12">
        <select name="a" defaultValue={a.slug} className="border border-line rounded-sm px-4 py-2.5 text-sm bg-panel text-ink w-full sm:w-56">
          {destinations.map(d => <option key={d.slug} value={d.slug}>{d.country}</option>)}
        </select>
        <ArrowLeftRight size={16} className="text-gold shrink-0" />
        <select name="b" defaultValue={b.slug} className="border border-line rounded-sm px-4 py-2.5 text-sm bg-panel text-ink w-full sm:w-56">
          {destinations.map(d => <option key={d.slug} value={d.slug}>{d.country}</option>)}
        </select>
        <button type="submit" className="px-6 py-2.5 bg-ink text-page text-xs tracking-[0.16em] uppercase rounded-sm hover:bg-ink/90 transition-colors w-full sm:w-auto">
          Compare
        </button>
      </form>

      <div className="grid sm:grid-cols-2 gap-8 sm:gap-10">
        {pair.map(d => {
          const meta = getCountryMeta(d.country);
          const coords = COUNTRY_CENTROIDS[d.country];
          const flight = flightEstimate(d.country);
          return (
            <div key={d.slug} className="space-y-4">
              <Link href={`/destinations/${d.slug}`} className="group relative block aspect-[4/3] rounded-2xl overflow-hidden">
                <Image src={d.image} alt={d.country} fill sizes="(max-width:640px) 100vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-vc-950/80 via-vc-950/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-5">
                  <h2 className="font-serif text-2xl font-light text-[#f4f0e9]">{d.country}</h2>
                  <p className="text-[11px] tracking-[0.1em] uppercase text-white/70 mt-0.5">{d.count} {d.count === 1 ? "stay" : "stays"}</p>
                </div>
              </Link>

              <div className="flex flex-wrap items-center gap-2">
                {meta && <span className="text-xs border border-line rounded-full px-3 py-1.5 text-ink-muted">{meta.ccy} ({meta.symbol})</span>}
                {flight && (
                  <span className="inline-flex items-center gap-1.5 text-xs border border-line rounded-full px-3 py-1.5 text-ink-muted">
                    <Plane size={12} /> {flight}
                  </span>
                )}
              </div>
              {coords && <DestinationWeather lat={coords[0]} lng={coords[1]} />}

              <BestTimeToVisit country={d.country} />
              <SeasonalPriceIndicator country={d.country} />
              <TypicalCosts country={d.country} />
              <TippingGuide country={d.country} />
              <ConnectivityGuide country={d.country} />
              <HealthSafety country={d.country} />
              <GettingAround country={d.country} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
