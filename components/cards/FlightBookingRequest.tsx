"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import type { Flight } from "@/lib/types";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import TurnstileWidget from "@/components/ui/TurnstileWidget";

// "Request to book" flow for live fares (which aren't in the DB). Submits a
// flight enquiry the concierge confirms & ticket manually.
export default function FlightBookingRequest({ flight }: { flight: Flight }) {
  const { format } = useCurrency();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", date: "", passengers: "1", details: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const route = `${flight.originCity} (${flight.origin}) → ${flight.destinationCity} (${flight.destination})`;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(""); setBusy(true);
    const res = await fetch("/api/flight-request", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name, email: form.email, phone: form.phone,
        route, airline: `${flight.airline} ${flight.flightNumber}`, price: flight.price,
        date: form.date, passengers: form.passengers, details: form.details,
        turnstileToken: token,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) setDone(true); else setError(data.error ?? "Something went wrong.");
  };

  const field = "w-full bg-panel-soft border border-line rounded-sm px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-gold";

  return (
    <>
      <button onClick={() => setOpen(true)} className="sm:mt-3 inline-block px-6 py-2.5 border border-line-strong text-ink hover:bg-ink hover:text-page text-xs font-normal tracking-[0.12em] uppercase rounded-sm transition-all duration-300">
        {t("card.reserve")}
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-8">
          <div className="absolute inset-0 bg-vc-950/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg bg-panel-raised border border-line shadow-luxury max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 px-6 pt-6">
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-gold mb-1">Request to book</p>
                <p className="font-serif text-xl font-light text-ink">{flight.airline} · {flight.flightNumber}</p>
                <p className="text-sm text-ink-muted font-light mt-0.5">{route}</p>
                <p className="text-sm text-ink mt-1">{format(flight.price)} · <span className="text-gold text-xs">{t("card.liveFare")}</span></p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-ink-faint hover:text-ink shrink-0"><X size={20} /></button>
            </div>

            {done ? (
              <div className="px-6 py-10 text-center">
                <Check size={22} className="text-gold mx-auto mb-3" />
                <p className="font-serif text-xl text-ink mb-1">Request received.</p>
                <p className="text-ink-muted font-light">Our concierge will confirm the fare and availability, then arrange ticketing with you directly.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-xs tracking-[0.1em] uppercase text-ink-faint mb-1.5">Name *</label><input required className={field} value={form.name} onChange={e => set("name", e.target.value)} /></div>
                  <div><label className="block text-xs tracking-[0.1em] uppercase text-ink-faint mb-1.5">Email *</label><input required type="email" className={field} value={form.email} onChange={e => set("email", e.target.value)} /></div>
                  <div><label className="block text-xs tracking-[0.1em] uppercase text-ink-faint mb-1.5">Phone</label><input className={field} value={form.phone} onChange={e => set("phone", e.target.value)} /></div>
                  <div><label className="block text-xs tracking-[0.1em] uppercase text-ink-faint mb-1.5">Passengers</label><input type="number" min={1} className={field} value={form.passengers} onChange={e => set("passengers", e.target.value)} /></div>
                  <div className="sm:col-span-2"><label className="block text-xs tracking-[0.1em] uppercase text-ink-faint mb-1.5">Travel date</label><input type="date" className={field} value={form.date} onChange={e => set("date", e.target.value)} /></div>
                </div>
                <div><label className="block text-xs tracking-[0.1em] uppercase text-ink-faint mb-1.5">Notes</label><textarea rows={2} className={field} value={form.details} onChange={e => set("details", e.target.value)} placeholder="Seat preference, frequent flyer, flexibility…" /></div>
                <TurnstileWidget onToken={setToken} />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button type="submit" disabled={busy || !token} className="w-full px-7 py-3 bg-ink text-page text-xs tracking-[0.16em] uppercase rounded-sm hover:bg-ink/90 disabled:opacity-50">{busy ? "Sending…" : "Send booking request"}</button>
                <p className="text-[11px] text-ink-faint font-light text-center">No payment now — we&apos;ll confirm the fare before ticketing.</p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
