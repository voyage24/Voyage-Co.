"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";

export default function QuoteActions({ token, initialStatus }: { token: string; initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus);
  const [busy, setBusy] = useState(false);

  const respond = async (action: "accept" | "decline") => {
    if (busy) return;
    setBusy(true);
    const res = await fetch(`/api/quote/${token}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) setStatus(data.status);
  };

  if (status === "accepted") {
    return <p className="text-center text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl py-3">Accepted — thank you. Our team will be in touch to finalise payment and details.</p>;
  }
  if (status === "declined") {
    return <p className="text-center text-sm text-ink-muted bg-panel-soft border border-line rounded-xl py-3">You declined this quote. Changed your mind? Contact your advisor.</p>;
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <button onClick={() => respond("accept")} disabled={busy} className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-ink text-page text-xs tracking-[0.16em] uppercase rounded-sm hover:bg-ink/90 disabled:opacity-50">
        <Check size={16} /> Accept quote
      </button>
      <button onClick={() => respond("decline")} disabled={busy} className="px-6 py-3.5 border border-line-strong text-ink text-xs tracking-[0.16em] uppercase rounded-sm hover:bg-ink hover:text-page transition-all disabled:opacity-50">
        <X size={16} className="inline mr-1.5" /> Decline
      </button>
    </div>
  );
}
