"use client";

import { useEffect, useState } from "react";
import { TRIPS_CACHE_KEY } from "./OfflineTripSync";

type Doc = { label: string; url: string };
type Trip = {
  reference: string; itemTitle: string; type: string; status: string;
  checkIn: string | null; checkOut: string | null; guests: number;
  total: number; currency: string; seat: string | null; guestName: string;
  documents: Doc[];
};
type Cache = { name?: string; cachedAt?: string; trips: Trip[] };

const STATUS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-gray-100 text-gray-500 border-gray-200",
};

// Reads the on-device trip cache (written by OfflineTripSync) and shows it —
// this renders even with no network, so a member can pull up their booking
// reference and voucher at a check-in desk abroad.
export default function OfflineTrips() {
  const [cache, setCache] = useState<Cache | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(TRIPS_CACHE_KEY);
      if (raw) setCache(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  if (!cache || cache.trips.length === 0) return null;

  return (
    <div className="mt-10 text-left">
      <p className="text-[11px] tracking-[0.2em] uppercase text-ink-faint mb-3">Your trips (saved on this device)</p>
      <div className="space-y-3">
        {cache.trips.map(t => (
          <div key={t.reference} className="bg-panel border border-line rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-serif text-lg font-light text-ink truncate">{t.itemTitle}</p>
                <p className="text-xs text-ink-faint font-light mt-0.5">
                  {t.reference}
                  {t.checkIn && ` · ${t.checkIn}${t.checkOut ? ` → ${t.checkOut}` : ""}`}
                  {t.seat && ` · Seat ${t.seat}`}
                </p>
              </div>
              <span className={`text-[10px] uppercase tracking-wide px-2.5 py-1 rounded-full border shrink-0 ${STATUS[t.status] ?? STATUS.pending}`}>{t.status}</span>
            </div>
            {t.documents?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-line/60">
                {t.documents.map((d, i) => (
                  <a key={i} href={d.url} className="text-xs tracking-[0.1em] uppercase text-gold link-underline">{d.label}</a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {cache.cachedAt && (
        <p className="text-[11px] text-ink-faint mt-4">Last updated {new Date(cache.cachedAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
      )}
    </div>
  );
}
