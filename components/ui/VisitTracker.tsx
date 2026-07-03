"use client";

import { useEffect } from "react";

// Counts one visit per visitor per day (guarded by localStorage), so repeat
// page-loads or navigation on the same day don't inflate the total, and a
// return visitor on a new day is counted again.
export default function VisitTracker() {
  useEffect(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      if (localStorage.getItem("vc-visit-day") === today) return;
      localStorage.setItem("vc-visit-day", today);
      fetch("/api/visit", { method: "POST" }).catch(() => {});
    } catch {
      /* ignore */
    }
  }, []);
  return null;
}
