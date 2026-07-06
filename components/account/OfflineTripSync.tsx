"use client";

import { useEffect } from "react";

export const TRIPS_CACHE_KEY = "vc-trips-cache";

// Silently caches the member's trips to the device whenever the account page is
// open and online, so the offline page can show them with no signal.
export default function OfflineTripSync() {
  useEffect(() => {
    let cancelled = false;
    fetch("/api/account/trips")
      .then(r => r.json())
      .then(d => {
        if (cancelled || !d?.loggedIn) return;
        try { localStorage.setItem(TRIPS_CACHE_KEY, JSON.stringify(d)); } catch { /* quota / private mode */ }
      })
      .catch(() => { /* offline — keep the existing cache */ });
    return () => { cancelled = true; };
  }, []);
  return null;
}
