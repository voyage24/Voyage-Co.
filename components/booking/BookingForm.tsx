"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Calendar, Users } from "lucide-react";
import { useTrips } from "@/components/providers/TripsProvider";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import NotifyMe from "@/components/booking/NotifyMe";
import SeatMap from "@/components/booking/SeatMap";

export interface BookingItem {
  type: "hotel" | "flight" | "package" | "experience" | "train" | "cruise";
  id: string;
  title: string;
  subtitle: string;
  image?: string;
  price: number;
  priceLabel: string;
  needsDates?: boolean;
}

export default function BookingForm({ item, soldOut = false }: { item: BookingItem; soldOut?: boolean }) {
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    checkIn: "", checkOut: "", guests: 2, seat: "",
  });
  const setSeat = (s: string) => setForm(p => ({ ...p, seat: s }));
  const [confirmed, setConfirmed] = useState(false);
  const [reference, setReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { addTrip } = useTrips();
  const { format } = useCurrency();
  const { t } = useLanguage();

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(p => ({ ...p, [k]: k === "guests" ? Number(e.target.value) : e.target.value }));

  const nights = form.checkIn && form.checkOut
    ? Math.max(0, Math.round((new Date(form.checkOut).getTime() - new Date(form.checkIn).getTime()) / 86400000))
    : 0;

  const total = item.needsDates && nights > 0 ? item.price * nights : item.price;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError("");

    // All guest details are mandatory (dates + guests only when the item
    // needs them). Belt-and-braces over the native `required` attributes.
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError(t("booking.fillAllFields")); return;
    }
    if (item.needsDates) {
      if (!form.checkIn || !form.checkOut || !form.guests || form.guests < 1) {
        setError(t("booking.fillAllFields")); return;
      }
      if (new Date(form.checkOut) <= new Date(form.checkIn)) {
        setError(t("booking.checkoutAfterCheckin")); return;
      }
    }

    setSubmitting(true);
    const ref = "VC-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, email: form.email, phone: form.phone,
          itemType: item.type, itemId: item.id, itemTitle: item.title, image: item.image,
          checkIn: form.checkIn || null, checkOut: form.checkOut || null, guests: form.guests,
          seat: item.type === "flight" ? form.seat || null : null,
          total, ref,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error ?? "Could not complete the reservation."); setSubmitting(false); return; }
      // Mirror into the local "trips" list for quick reference.
      addTrip({ ref: data.reference ?? ref, type: item.type, title: item.title, subtitle: item.subtitle, image: item.image, total, guestName: form.name, bookedAt: new Date().toISOString() });
      setReference(data.reference ?? ref);
      setConfirmed(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  if (confirmed) {
    return (
      <div className="bg-panel border border-line rounded-2xl shadow-card p-10 text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 rounded-full border-2 border-gold flex items-center justify-center mx-auto mb-6">
          <Check size={28} className="text-gold" />
        </div>
        <h2 className="font-serif text-3xl font-light text-ink mb-3">{t("booking.reservationConfirmed")}</h2>
        <p className="text-ink-muted font-light mb-6">
          {t("booking.thankYou")}, {form.name.split(" ")[0] || t("booking.traveller")}. {t("booking.confirmationSentTo")} {form.email || t("booking.yourEmail")}.
        </p>
        <div className="inline-block bg-panel-soft border border-line rounded-sm px-6 py-3 mb-8">
          <p className="text-[10px] tracking-[0.2em] uppercase text-ink-faint mb-1">{t("booking.bookingReference")}</p>
          <p className="font-serif text-2xl font-light text-ink tracking-wider">{reference}</p>
        </div>
        <div className="text-left max-w-sm mx-auto border-t border-line pt-6 mb-8 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-ink-muted font-light">{item.title}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-ink-faint font-light">{item.subtitle}</span>
          </div>
          {item.type === "flight" && form.seat && (
            <div className="flex justify-between text-sm pt-2">
              <span className="text-ink-muted font-light">Seat</span>
              <span className="text-ink font-medium">{form.seat}</span>
            </div>
          )}
          <div className="flex justify-between text-sm pt-2">
            <span className="text-ink-muted font-light">{t("booking.total")}</span>
            <span className="font-serif text-xl text-ink">{format(total)}</span>
          </div>
        </div>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/trips" className="inline-block px-8 py-3.5 bg-ink text-page text-xs tracking-[0.16em] uppercase rounded-sm hover:bg-ink/90 transition-colors">
            {t("booking.viewMyTrips")}
          </Link>
          <Link href="/" className="inline-block px-8 py-3.5 border border-line-strong text-ink text-xs tracking-[0.16em] uppercase rounded-sm hover:bg-ink hover:text-page transition-all">
            {t("booking.returnHome")}
          </Link>
        </div>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3 rounded-sm bg-panel-soft border border-line text-sm text-ink focus:outline-none focus:border-ink transition-colors";
  const labelClass = "text-[11px] font-medium text-ink-faint uppercase tracking-[0.12em] block mb-2";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* Form */}
      <form onSubmit={handleSubmit} className="lg:col-span-3 bg-panel border border-line rounded-2xl shadow-card p-8 space-y-5">
        <h2 className="font-serif text-2xl font-light text-ink mb-2">{t("booking.guestDetails")}</h2>

        <div>
          <label className={labelClass}>{t("booking.fullName")} *</label>
          <input required value={form.name} onChange={set("name")} placeholder={t("booking.fullNamePlaceholder")} className={inputClass} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{t("booking.email")} *</label>
            <input required type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>{t("booking.phone")} *</label>
            <input required type="tel" value={form.phone} onChange={set("phone")} placeholder="+91 98765 43210" className={inputClass} />
          </div>
        </div>

        {item.needsDates && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}><Calendar size={11} className="inline mr-1" />{t("hotelSearch.checkIn")} *</label>
              <input required type="date" value={form.checkIn} onChange={set("checkIn")} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}><Calendar size={11} className="inline mr-1" />{t("hotelSearch.checkOut")} *</label>
              <input required type="date" value={form.checkOut} onChange={set("checkOut")} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}><Users size={11} className="inline mr-1" />{t("hotelSearch.guests")} *</label>
              <input required type="number" min={1} max={12} value={form.guests} onChange={set("guests")} className={inputClass} />
            </div>
          </div>
        )}

        {item.type === "flight" && (
          <div>
            <label className={labelClass}>Choose your seat <span className="text-ink-faint normal-case tracking-normal">(optional)</span></label>
            <SeatMap seed={item.id} value={form.seat} onChange={setSeat} />
            <p className="text-xs text-ink-faint font-light mt-2">
              {form.seat ? `Seat ${form.seat} selected — it will appear on your boarding pass.` : "Leave blank to have a seat assigned at check-in."}
            </p>
          </div>
        )}

        {error && <p className="text-sm text-red-600 font-light text-center">{error}</p>}
        <button
          type="submit"
          disabled={submitting || soldOut}
          className="w-full py-4 bg-ink hover:bg-ink/90 disabled:opacity-50 disabled:cursor-not-allowed text-page font-medium text-xs tracking-[0.16em] uppercase rounded-sm transition-colors"
        >
          {soldOut ? t("booking.fullyBooked") : submitting ? t("booking.sending") : t("booking.confirmReservation")}
        </button>
        {soldOut ? (
          <div className="pt-2"><NotifyMe type={item.type} itemId={item.id} itemTitle={item.title} /></div>
        ) : (
          <p className="text-xs text-ink-faint font-light text-center">
            {t("booking.noPaymentNow")}
          </p>
        )}
      </form>

      {/* Summary */}
      <div className="lg:col-span-2">
        <div className="bg-panel border border-line rounded-2xl shadow-card overflow-hidden lg:sticky lg:top-28">
          {item.image && (
            <div className="relative aspect-[16/10]">
              <Image src={item.image} alt={item.title} fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" />
            </div>
          )}
          <div className="p-6">
            <p className="text-[10px] tracking-[0.2em] uppercase text-gold mb-2">{t(`booking.type.${item.type}`)}</p>
            <h3 className="font-serif text-xl font-light text-ink leading-snug mb-1">{item.title}</h3>
            <p className="text-sm text-ink-muted font-light mb-5">{item.subtitle}</p>

            <div className="border-t border-line pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-ink-muted font-light">{t("booking.price")} ({t(item.priceLabel)})</span>
                <span className="text-ink">{format(item.price)}</span>
              </div>
              {item.needsDates && nights > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-ink-muted font-light">{nights} {nights > 1 ? t("datePicker.nights") : t("datePicker.night")}</span>
                  <span className="text-ink">× {nights}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline border-t border-line pt-3 mt-2">
                <span className="text-[11px] tracking-[0.14em] uppercase text-ink-faint">{t("booking.total")}</span>
                <span className="font-serif text-2xl font-light text-ink">{format(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
