"use client";

import { useState } from "react";
import { FileText, MessageSquarePlus, Share2 } from "lucide-react";

type Doc = { label: string; url: string };

export default function BookingActions({ reference, documents }: { reference: string; documents: Doc[] }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [shareMsg, setShareMsg] = useState("");

  const share = async () => {
    setShareMsg("");
    const res = await fetch(`/api/account/trips/${reference}/share`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.url) { setShareMsg("Couldn't create the link."); return; }
    try {
      if (navigator.share) { await navigator.share({ title: "My trip with Voyages & Co.", url: data.url }); return; }
      await navigator.clipboard.writeText(data.url);
      setShareMsg("Companion link copied.");
    } catch { setShareMsg(data.url); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setError("");
    const res = await fetch("/api/account/change-request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reference, message }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) { setDone(true); setMessage(""); } else setError(data.error ?? "Something went wrong.");
  };

  return (
    <div className="border-t border-line mt-1 pt-3 flex flex-col gap-3">
      {documents.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {documents.map((d, i) => (
            <a key={i} href={d.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-gold border border-line rounded-full px-3 py-1.5">
              <FileText size={13} /> {d.label}
            </a>
          ))}
        </div>
      )}

      {done ? (
        <p className="text-xs text-gold">Change request sent — our team will be in touch.</p>
      ) : open ? (
        <form onSubmit={submit} className="space-y-2">
          <textarea value={message} onChange={e => setMessage(e.target.value)} rows={2} placeholder="What would you like to change? (dates, guests, room…)"
            className="w-full bg-panel-soft border border-line rounded-sm px-3 py-2 text-sm text-ink focus:outline-none focus:border-gold" />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="text-xs tracking-[0.12em] uppercase bg-ink text-page px-4 py-2 rounded-sm hover:bg-ink/90 disabled:opacity-50">{busy ? "Sending…" : "Send request"}</button>
            <button type="button" onClick={() => setOpen(false)} className="text-xs tracking-[0.12em] uppercase text-ink-muted px-2">Cancel</button>
          </div>
        </form>
      ) : (
        <div className="flex flex-wrap items-center gap-4">
          <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 text-xs tracking-[0.1em] uppercase text-ink-muted hover:text-ink">
            <MessageSquarePlus size={14} /> Request a change
          </button>
          <button onClick={share} className="inline-flex items-center gap-1.5 text-xs tracking-[0.1em] uppercase text-ink-muted hover:text-ink">
            <Share2 size={14} /> Share with a companion
          </button>
          {shareMsg && <span className="text-xs text-gold">{shareMsg}</span>}
        </div>
      )}
    </div>
  );
}
