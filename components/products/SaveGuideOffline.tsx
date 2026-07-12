"use client";

import { useState } from "react";
import { DownloadCloud, Check } from "lucide-react";

// Pre-caches this destination guide (page + its live holiday/currency data) into
// the Cache API so it works with no signal abroad. The service worker's offline
// fallback already searches all caches, so a saved guide is served automatically
// when the device is offline. Only shown where the Cache API is available.
export default function SaveGuideOffline({ country }: { country: string }) {
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");

  const save = async (e: React.MouseEvent) => {
    // May sit inside a <summary>; don't toggle the <details> when tapped.
    e.preventDefault(); e.stopPropagation();
    if (typeof caches === "undefined") { setState("error"); return; }
    setState("saving");
    try {
      const c = await caches.open("vc-guides");
      const urls = [
        location.pathname,
        "/api/content/rates",
        `/api/content/holidays?country=${encodeURIComponent(country)}`,
      ];
      await Promise.all(urls.map(u => c.add(u).catch(() => {})));
      setState("done");
    } catch { setState("error"); }
  };

  if (state === "error") return null;

  return (
    <button
      onClick={save}
      disabled={state !== "idle"}
      className="inline-flex items-center gap-2 text-xs px-3 py-2 rounded-full border border-line text-ink-muted hover:border-gold hover:text-ink transition-colors disabled:opacity-70"
    >
      {state === "done" ? <><Check size={14} className="text-emerald-600" /> Saved for offline</>
        : state === "saving" ? "Saving…"
        : <><DownloadCloud size={14} className="text-gold" /> Save for offline</>}
    </button>
  );
}
