"use client";

import { useEffect } from "react";

// Registers the service worker for installable / offline support.
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const onLoad = () => navigator.serviceWorker.register("/sw.js").catch(() => {});
      window.addEventListener("load", onLoad);
      return () => window.removeEventListener("load", onLoad);
    }
  }, []);
  return null;
}
