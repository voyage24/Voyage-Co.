"use client";

import { useState } from "react";

export default function NotifyMe({ type, itemId, itemTitle }: { type: string; itemId: string; itemTitle: string }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    const res = await fetch("/api/notify", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, type, itemId, itemTitle }),
    });
    setLoading(false);
    if (res.ok) setDone(true);
  };

  if (done) {
    return <p className="text-sm text-gold text-center">Thank you — we&apos;ll let you know the moment a place opens.</p>;
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <p className="text-sm text-ink-muted font-light text-center">Fully booked — leave your email and we&apos;ll notify you if a place opens.</p>
      <div className="flex items-center border-b border-line-strong focus-within:border-ink transition-colors">
        <input
          type="email" required value={email} onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="flex-1 bg-transparent py-2.5 text-sm text-ink placeholder:text-ink-faint outline-none"
        />
        <button type="submit" disabled={loading} className="text-[11px] tracking-[0.16em] uppercase text-ink hover:text-gold pl-4 disabled:opacity-50">
          {loading ? "…" : "Notify me"}
        </button>
      </div>
    </form>
  );
}
