"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, AlertCircle, Plane, MapPin } from "lucide-react";
import FlightCard from "@/components/cards/FlightCard";
import FlightSearch from "@/components/search/FlightSearch";
import DestinationMap from "@/components/home/DestinationMap";
import { CITIES } from "@/lib/mock-data";
import { AIRLINES } from "@/lib/airlines";
import type { Flight, City } from "@/lib/types";
import { useLanguage } from "@/components/providers/LanguageProvider";

function FlightsContent({ flights }: { flights: Flight[] }) {
  const { t } = useLanguage();
  const params      = useSearchParams();
  const fromCode    = params.get("from")   ?? "";
  const toCode      = params.get("to")     ?? "";
  const depDate     = params.get("dep")    ?? "";
  const retDate     = params.get("ret")    ?? "";
  const cabin       = params.get("cabin")  ?? "Economy";
  const guests      = Number(params.get("guests") ?? "1");
  const airlineParam = params.get("airline") ?? "";

  const fromCity = CITIES.find(c => c.code === fromCode) ?? null;
  const toCity   = CITIES.find(c => c.code === toCode)   ?? null;

  // Live map state — mirrors the homepage hero: updates instantly as the
  // traveller edits From/To in the search form, independent of the URL.
  const [liveFrom, setLiveFrom] = useState<City | null>(fromCity);
  const [liveTo, setLiveTo]     = useState<City | null>(toCity);

  const mockFlights = useMemo(() => {
    if (!fromCode && !toCode) return flights;
    const filtered = flights.filter(f => {
      const mFrom = !fromCode || f.origin      === fromCode;
      const mTo   = !toCode   || f.destination === toCode;
      return mFrom && mTo;
    });
    return filtered.length > 0 ? filtered : flights;
  }, [flights, fromCode, toCode]);

  const isFiltered = (fromCode || toCode) &&
    flights.some(f => (!fromCode || f.origin === fromCode) && (!toCode || f.destination === toCode));

  // Live fares — only attempted once we have a real route + departure date.
  const [liveFlights, setLiveFlights] = useState<Flight[] | null>(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError,   setLiveError]   = useState<string | null>(null);

  useEffect(() => {
    if (!fromCity || !toCity || !depDate) {
      setLiveFlights(null);
      setLiveError(null);
      return;
    }

    let cancelled = false;
    setLiveLoading(true);
    setLiveError(null);

    const qp = new URLSearchParams({
      origin: fromCity.code,
      destination: toCity.code,
      departureDate: depDate,
      adults: String(guests),
      travelClass: cabin,
    });
    if (retDate) qp.set("returnDate", retDate);

    fetch(`/api/flights/search?${qp.toString()}`)
      .then(async res => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Failed to fetch live fares");
        return json.flights as Array<Flight & { origin: string; destination: string }>;
      })
      .then(flights => {
        if (cancelled) return;
        const mapped: Flight[] = flights.map(f => ({
          ...f,
          originCity: fromCity.name,
          destinationCity: toCity.name,
          amenities: [],
          source: "live",
        }));
        setLiveFlights(mapped);
      })
      .catch(err => {
        if (cancelled) return;
        setLiveError(err instanceof Error ? err.message : "Failed to fetch live fares");
        setLiveFlights(null);
      })
      .finally(() => { if (!cancelled) setLiveLoading(false); });

    return () => { cancelled = true; };
  }, [fromCity, toCity, depDate, retDate, guests, cabin]);

  const showingLive = !!liveFlights && liveFlights.length > 0;
  const routeFlights = showingLive ? liveFlights! : mockFlights;

  // Airline filter — sourced from the full worldwide AIRLINES dataset so
  // every carrier is selectable, even ones not present in the current results.
  // Pre-filled from the search bar's own airline preference, if one was set.
  const [airlineFilter, setAirlineFilter] = useState(airlineParam);
  const sortedAirlines = useMemo(
    () => [...AIRLINES].sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  // Destination filter — sourced from the full worldwide CITIES dataset, so
  // you can narrow results to any destination, not just ones in the current list.
  const [destinationFilter, setDestinationFilter] = useState("");
  const sortedDestinations = useMemo(
    () => [...CITIES].sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  const displayFlights = routeFlights.filter(f =>
    (!airlineFilter || f.airlineCode === airlineFilter) &&
    (!destinationFilter || f.destination === destinationFilter)
  );

  const activeFilterLabel = [
    sortedAirlines.find(a => a.code === airlineFilter)?.name,
    sortedDestinations.find(c => c.code === destinationFilter)?.name && `${t("flightsPage.flightsTo")} ${sortedDestinations.find(c => c.code === destinationFilter)?.name}`,
  ].filter(Boolean).join(" · ");

  return (
    <div className="max-w-[1100px] mx-auto px-6 lg:px-12 pt-28 pb-24">

      {/* Search widget */}
      <div className="mb-6 bg-panel-raised border border-line shadow-card p-5">
        <p className="text-[10px] tracking-[0.24em] uppercase text-ink-faint mb-4 font-medium">{t("flightsPage.searchFlights")}</p>
        <FlightSearch
          defaultFrom={fromCity}
          defaultTo={toCity}
          defaultAirline={airlineParam}
          onRouteChange={(f, t) => { setLiveFrom(f); setLiveTo(t); }}
        />
      </div>

      {/* Interactive destination map — same live experience as the homepage hero */}
      <div className="relative h-72 sm:h-96 mb-10 border border-line overflow-hidden">
        <DestinationMap from={liveFrom} to={liveTo} />
      </div>

      {/* Status / results header */}
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <span className="text-[11px] tracking-[0.2em] uppercase text-ink-muted truncate min-w-0">
          {liveLoading
            ? t("flightsPage.searchingLiveFares")
            : `${displayFlights.length} ${displayFlights.length !== 1 ? t("trainsPage.services") : t("trainsPage.service")}${
                isFiltered && fromCity && toCity ? ` · ${fromCity.name} → ${toCity.name}` : ` · ${t("flightsPage.allRoutes")}`
              }`}
        </span>
        {liveLoading && <Loader2 size={14} className="animate-spin text-gold shrink-0" />}

        {/* Filters — fixed widths and pinned to the right so neither box ever
            shifts position or grows past its box, regardless of how long the
            selected destination/airline name is or how the status text above
            changes length. */}
        <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:items-center sm:w-auto sm:ml-auto sm:shrink-0 sm:flex-wrap">
          {/* Destination filter — every airport worldwide, not just ones in the current results */}
          <div className="flex items-center gap-1.5 bg-panel border border-line px-3 py-1.5 w-full sm:w-44 sm:shrink-0">
            <MapPin size={12} className="text-gold shrink-0" />
            <select
              value={destinationFilter}
              onChange={e => setDestinationFilter(e.target.value)}
              className="w-full min-w-0 bg-transparent text-[11px] text-ink-muted focus:outline-none cursor-pointer truncate"
            >
              <option value="">{t("flightsPage.allDestinations")}</option>
              {sortedDestinations.map(c => (
                <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
              ))}
            </select>
          </div>

          {/* Airline filter — every airline worldwide, not just ones in the current results */}
          <div className="flex items-center gap-1.5 bg-panel border border-line px-3 py-1.5 w-full sm:w-44 sm:shrink-0">
            <Plane size={12} className="text-gold shrink-0" />
            <select
              value={airlineFilter}
              onChange={e => setAirlineFilter(e.target.value)}
              className="w-full min-w-0 bg-transparent text-[11px] text-ink-muted focus:outline-none cursor-pointer truncate"
            >
              <option value="">{t("flightsPage.allAirlines")}</option>
              {sortedAirlines.map(a => (
                <option key={a.code} value={a.code}>{a.name} ({a.code})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {showingLive && !liveLoading && (
        <p className="text-[11px] text-gold font-medium mb-6">{t("flightsPage.liveFaresUpdated")}</p>
      )}
      {!showingLive && !liveLoading && depDate && fromCity && toCity && (
        <div className="flex items-start gap-2 mb-6 text-[12px] text-ink-faint font-light">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <p>
            {liveError
              ? `${t("flightsPage.couldntLoadLiveFaresPrefix")}${liveError}${t("flightsPage.couldntLoadLiveFaresSuffix")}`
              : t("flightsPage.noLiveFaresFound")}
          </p>
        </div>
      )}
      {!depDate && (
        <p className="text-[12px] text-ink-faint font-light mb-6">
          {t("flightsPage.addDepartureDateHint")}
        </p>
      )}

      <div className="space-y-4">
        {liveLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-panel-soft border border-line animate-pulse" />
          ))
        ) : displayFlights.length === 0 ? (
          <div className="text-center py-16 border border-line bg-panel-soft">
            <p className="text-sm text-ink-muted font-light">
              {t("flightsPage.noServicesMatch")} {activeFilterLabel || t("flightsPage.thisFilter")}.
            </p>
            <button
              onClick={() => { setAirlineFilter(""); setDestinationFilter(""); }}
              className="mt-3 text-[11px] tracking-[0.16em] uppercase text-gold hover:underline"
            >
              {t("listing.clearFilters")}
            </button>
          </div>
        ) : (
          displayFlights.map(f => <FlightCard key={f.id} flight={f} />)
        )}
      </div>
    </div>
  );
}

export default function FlightsPageClient({ flights }: { flights: Flight[] }) {
  return (
    <Suspense fallback={
      <div className="max-w-[1100px] mx-auto px-6 pt-32 pb-24 space-y-4">
        <div className="h-40 bg-panel-soft animate-pulse" />
        <div className="h-24 bg-panel-soft animate-pulse" />
        <div className="h-24 bg-panel-soft animate-pulse" />
      </div>
    }>
      <FlightsContent flights={flights} />
    </Suspense>
  );
}
