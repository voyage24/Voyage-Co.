"use client";

import { useState } from "react";
import { DownloadCloud, Check } from "lucide-react";

// Pre-caches every wallet item (document files + boarding/QR passes + vouchers)
// into the Cache API so the whole wallet works with no signal at the airport.
// The service worker's offline fallback searches all caches, so saved items are
// served automatically when offline.
export default function WalletOffline({ urls }: { urls: string[] }) {
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");

  const save = async () => {
    if (typeof caches === "undefined" || urls.length === 0) { setState("error"); return; }
    setState("saving");
    try {
      const c = await caches.open("vc-wallet");
      await Promise.all(urls.map(u => c.add(u).catch(() => {})));
      setState("done");
    } catch { setState("error"); }
  };

  if (state === "error") return null;

  return (
    <button
      onClick={save}
      disabled={state !== "idle"}
      className="inline-flex items-center gap-2 text-xs tracking-[0.1em] uppercase px-4 py-2.5 rounded-sm border border-line-strong text-ink hover:bg-ink hover:text-page transition-colors disabled:opacity-70"
    >
      {state === "done" ? <><Check size={14} className="text-emerald-600" /> Saved for offline</>
        : state === "saving" ? "Saving…"
        : <><DownloadCloud size={14} /> Make available offline</>}
    </button>
  );
}
