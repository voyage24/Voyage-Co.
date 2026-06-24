"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";

export default function CancellationsPage() {
  const { t } = useLanguage();
  const sections = [
    {
      title: "Flight Cancellations",
      content: [
        { heading: "Flexible Fares", text: "Where your itinerary permits, your concierge can cancel or amend flights on your behalf. Any partner charges are communicated transparently in advance, and balances refunded promptly to your original payment method." },
        { heading: "Restricted Fares", text: "Certain fares are non-refundable but may permit rebooking for a change fee. Your specialist will confirm the exact conditions before any booking is made." },
        { heading: "Carrier-Initiated Changes", text: "If a carrier cancels or significantly delays your flight, you are entitled to a full refund or complimentary rebooking. We will proactively manage this on your behalf." },
      ],
    },
    {
      title: "Stay Cancellations",
      content: [
        { heading: "Flexible Rate Stays", text: "Stays booked on a flexible rate can be cancelled without charge up to the date noted in your confirmation. After that date, the first night may be charged." },
        { heading: "Non-Refundable Stays", text: "Certain exclusive properties require non-refundable bookings. The full amount is committed at the time of reservation, regardless of subsequent changes." },
        { heading: "No-Show Policy", text: "If you do not arrive and have not cancelled, the property's no-show policy applies — typically the full booking amount is forfeited." },
      ],
    },
    {
      title: "Journey Cancellations",
      content: [
        { heading: "30+ Days Before Travel", text: "15% of total journey cost as cancellation charge." },
        { heading: "15–29 Days Before Travel", text: "30% of total journey cost as cancellation charge." },
        { heading: "7–14 Days Before Travel", text: "50% of total journey cost as cancellation charge." },
        { heading: "Less than 7 Days", text: "100% of total journey cost — no refund." },
      ],
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
      <div className="mb-10">
        <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-3">{t("legal.eyebrow")}</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-3">{t("cancellations.title")}</h1>
        <p className="text-ink-faint font-light">{t("legal.lastUpdated")}: June 2026</p>
      </div>

      <div className="bg-gold/5 border border-gold/30 rounded-2xl p-5 mb-8 text-sm text-ink-muted font-light">
        <strong className="text-gold font-medium">{t("cancellations.noteLabel")}</strong> {t("cancellations.noteText")}
      </div>

      <div className="space-y-8">
        {sections.map(s => (
          <div key={s.title}>
            <h2 className="font-serif text-2xl font-light text-ink mb-4">{s.title}</h2>
            <div className="space-y-4">
              {s.content.map(c => (
                <div key={c.heading} className="bg-panel rounded-2xl border border-line shadow-card p-5">
                  <h3 className="font-medium text-ink mb-1.5">{c.heading}</h3>
                  <p className="text-sm text-ink-muted leading-relaxed font-light">{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-panel-soft rounded-2xl p-6 text-sm text-ink-muted border border-line font-light">
        <p className="font-medium text-ink mb-2">{t("cancellations.needHelp")}</p>
        <p>{t("cancellations.callConcierge")} <a href="tel:+919919910213" className="text-gold link-underline">+91 99199 10213</a> {t("cancellations.orEmail")} <a href="mailto:hello@voyagesco.com" className="text-gold link-underline">hello@voyagesco.com</a></p>
      </div>
    </div>
  );
}
