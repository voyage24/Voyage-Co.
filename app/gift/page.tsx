"use client";

import { useState } from "react";
import { Gift, Check } from "lucide-react";
import { useContent } from "@/components/providers/ContentProvider";
import TurnstileWidget from "@/components/ui/TurnstileWidget";

const AMOUNTS = [25000, 50000, 100000, 250000];

export default function GiftPage() {
  const c = useContent();
  const [form, setForm] = useState({ senderName: "", senderEmail: "", recipientName: "", recipientEmail: "", amount: AMOUNTS[1], message: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const set = (k: keyof typeof form, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  const [token, setToken] = useState("");
  const [code, setCode] = useState("");
  const [balance, setBalance] = useState<{ found: boolean; balance?: number; status?: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(""); setBusy(true);
    const res = await fetch("/api/gift/request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, turnstileToken: token }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) setDone(true); else setError(data.error ?? "Something went wrong.");
  };

  const check = async () => {
    const res = await fetch("/api/gift/balance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
    setBalance(await res.json());
  };

  const field = "w-full bg-panel-soft border border-line rounded-sm px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-gold";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <div className="text-center mb-8">
        <Gift size={26} className="text-gold mx-auto mb-3" />
        <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-2">{c("gift.eyebrow") || "The gift of travel"}</p>
        <h1 className="font-serif text-3xl sm:text-4xl font-light text-ink mb-3">{c("gift.title") || "Gift a journey"}</h1>
        <p className="text-ink-muted font-light max-w-lg mx-auto">{c("gift.intro") || "Give someone an unforgettable escape. Tell us the details and our concierge will arrange a beautifully presented gift card."}</p>
      </div>

      {done ? (
        <div className="bg-panel border border-line rounded-2xl p-8 text-center">
          <Check size={22} className="text-gold mx-auto mb-3" />
          <p className="font-serif text-xl text-ink mb-1">Request received.</p>
          <p className="text-ink-muted font-light">Our concierge will email you to arrange payment and issue the gift card.</p>
        </div>
      ) : (
        <form onSubmit={submit} className="bg-panel border border-line rounded-2xl p-6 sm:p-8 space-y-4">
          <div>
            <label className="block text-xs tracking-[0.1em] uppercase text-ink-faint mb-1.5">Amount</label>
            <div className="flex flex-wrap gap-2">
              {AMOUNTS.map(a => (
                <button key={a} type="button" onClick={() => set("amount", a)}
                  className={`text-sm px-4 py-2 rounded-sm border transition-colors ${form.amount === a ? "bg-ink text-page border-ink" : "border-line text-ink-muted hover:border-ink-strong"}`}>
                  ₹{a.toLocaleString("en-IN")}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-xs tracking-[0.1em] uppercase text-ink-faint mb-1.5">Your name *</label><input required className={field} value={form.senderName} onChange={e => set("senderName", e.target.value)} /></div>
            <div><label className="block text-xs tracking-[0.1em] uppercase text-ink-faint mb-1.5">Your email *</label><input required type="email" className={field} value={form.senderEmail} onChange={e => set("senderEmail", e.target.value)} /></div>
            <div><label className="block text-xs tracking-[0.1em] uppercase text-ink-faint mb-1.5">Recipient name</label><input className={field} value={form.recipientName} onChange={e => set("recipientName", e.target.value)} /></div>
            <div><label className="block text-xs tracking-[0.1em] uppercase text-ink-faint mb-1.5">Recipient email</label><input type="email" className={field} value={form.recipientEmail} onChange={e => set("recipientEmail", e.target.value)} /></div>
          </div>
          <div><label className="block text-xs tracking-[0.1em] uppercase text-ink-faint mb-1.5">Personal message (optional)</label><textarea rows={3} className={field} value={form.message} onChange={e => set("message", e.target.value)} /></div>
          <TurnstileWidget onToken={setToken} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={busy || !token} className="w-full sm:w-auto px-7 py-3 bg-ink text-page text-xs tracking-[0.16em] uppercase rounded-sm hover:bg-ink/90 disabled:opacity-50">{busy ? "Sending…" : "Request gift card"}</button>
        </form>
      )}

      {/* Balance checker */}
      <div className="mt-10 bg-panel-soft border border-line rounded-2xl p-6">
        <p className="text-sm font-medium text-ink mb-3">Check a gift card balance</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input value={code} onChange={e => setCode(e.target.value)} placeholder="VC-XXXX-XXXX" className={`${field} flex-1`} />
          <button onClick={check} className="px-5 py-2.5 border border-line-strong text-ink text-xs tracking-[0.14em] uppercase rounded-sm hover:bg-ink hover:text-page transition-all">Check</button>
        </div>
        {balance && (
          balance.found
            ? <p className="mt-3 text-sm text-ink">Balance: <span className="font-medium">₹{(balance.balance ?? 0).toLocaleString("en-IN")}</span> · <span className="capitalize">{balance.status}</span></p>
            : <p className="mt-3 text-sm text-ink-muted">No gift card found with that code.</p>
        )}
      </div>
    </div>
  );
}
