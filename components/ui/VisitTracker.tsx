"use client";

import { useEffect } from "react";

// Counts one site visit per browser session (guarded by sessionStorage so
// navigating between pages doesn't inflate the total).
export default function VisitTracker() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem("vc-visited")) return;
      sessionStorage.setItem("vc-visited", "1");
      fetch("/api/visit", { method: "POST" }).catch(() => {});
    } catch {
      /* ignore */
    }
  }, []);
  return null;
}
