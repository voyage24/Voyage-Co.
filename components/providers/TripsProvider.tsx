"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export interface Trip {
  ref: string;
  type: "hotel" | "flight" | "package" | "experience" | "train" | "cruise";
  title: string;
  subtitle: string;
  image?: string;
  total: number;
  guestName: string;
  bookedAt: string;   // ISO date
}

interface TripsContextValue {
  trips: Trip[];
  addTrip: (t: Trip) => void;
  removeTrip: (ref: string) => void;
}

const TripsContext = createContext<TripsContextValue | null>(null);
const STORAGE_KEY = "vc-trips";

export function TripsProvider({ children }: { children: React.ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>([]);

  // Load once on the client (avoids SSR/CSR mismatch).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTrips(JSON.parse(raw));
    } catch {}
  }, []);

  const addTrip = useCallback((t: Trip) => {
    setTrips(prev => {
      const next = [t, ...prev.filter(x => x.ref !== t.ref)];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const removeTrip = useCallback((ref: string) => {
    setTrips(prev => {
      const next = prev.filter(x => x.ref !== ref);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  return (
    <TripsContext.Provider value={{ trips, addTrip, removeTrip }}>
      {children}
    </TripsContext.Provider>
  );
}

export function useTrips() {
  const ctx = useContext(TripsContext);
  if (!ctx) throw new Error("useTrips must be used within TripsProvider");
  return ctx;
}
