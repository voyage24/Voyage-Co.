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
      const device =
        window.matchMedia("(max-width: 767px)").matches || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
          ? "mobile"
          : "desktop";
      fetch("/api/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device }),
      }).catch(() => {});
    } catch {
      /* ignore */
    }
  }, []);
  return null;
}
