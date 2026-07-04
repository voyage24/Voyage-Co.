"use client";

import { useCallback, useEffect, useState } from "react";

// Drives the one-time "Click to zoom" hint shown on the live maps. It fades in
// on first load and stays dismissed once the traveller has interacted (or after
// a timeout), remembered across visits via localStorage so it never nags.
const KEY = "vc-map-zoom-hint";

export function useZoomHint(timeout = 6000) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let seen = false;
    try { seen = localStorage.getItem(KEY) === "1"; } catch {}
    if (seen) return;
    setShow(true);
    const t = setTimeout(() => setShow(false), timeout);
    return () => clearTimeout(t);
  }, [timeout]);

  const dismiss = useCallback(() => {
    setShow(false);
    try { localStorage.setItem(KEY, "1"); } catch {}
  }, []);

  return { show, dismiss };
}
