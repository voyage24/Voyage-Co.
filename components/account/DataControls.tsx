"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Trash2, ShieldCheck } from "lucide-react";

export default function DataControls() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const del = async () => {
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      if (!res.ok) { setError("Could not delete your account. Please contact the concierge."); setBusy(false); return; }
      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setBusy(false);
    }
  };

  return (
    <div className="bg-panel border border-line rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-1">
        <ShieldCheck size={16} className="text-gold" />
        <h2 className="font-serif text-xl font-light text-ink">Your data &amp; privacy</h2>
      </div>
      <p className="text-sm text-ink-muted font-light mb-5">Download everything we hold about you, or permanently close your account.</p>

      <div className="flex flex-wrap gap-3">
        <a href="/api/account/export" className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-line-strong text-ink text-xs tracking-[0.12em] uppercase rounded-sm hover:bg-ink hover:text-page transition-all">
          <Download size={14} /> Download my data
        </a>
        {!confirming && (
          <button onClick={() => setConfirming(true)} className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-red-300 text-red-600 text-xs tracking-[0.12em] uppercase rounded-sm hover:bg-red-600 hover:text-white hover:border-red-600 transition-all">
            <Trash2 size={14} /> Delete my account
          </button>
        )}
      </div>

      {confirming && (
        <div className="mt-4 rounded-sm border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700 font-light mb-3">
            This permanently deletes your account, saved journeys, itineraries and searches — it can&apos;t be undone. Past bookings are kept for our records but unlinked from you.
          </p>
          <div className="flex flex-wrap gap-3">
            <button onClick={del} disabled={busy} className="px-4 py-2 bg-red-600 text-white text-xs tracking-[0.12em] uppercase rounded-sm hover:bg-red-700 disabled:opacity-50 transition-colors">
              {busy ? "Deleting…" : "Yes, delete permanently"}
            </button>
            <button onClick={() => setConfirming(false)} disabled={busy} className="px-4 py-2 border border-line-strong text-ink text-xs tracking-[0.12em] uppercase rounded-sm hover:bg-panel-soft transition-colors">
              Cancel
            </button>
          </div>
          {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        </div>
      )}
    </div>
  );
}
