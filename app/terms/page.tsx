"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";

export default function TermsPage() {
  const { t } = useLanguage();
  const sections = [
    { title: "Acceptance of Terms", body: "By accessing or using Voyages & Co. (voyagesco.com), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use our services. These terms apply to all users, including members, prospective members, and partners." },
    { title: "Booking & Reservations", body: "All arrangements made through Voyages & Co. are subject to availability and confirmation by the respective travel partner. A booking is confirmed only when you receive a confirmation with a reference number. Prices quoted are subject to change until payment is completed." },
    { title: "Pricing & Payment", body: "Prices are quoted in the agreed currency, inclusive of applicable taxes unless stated otherwise. Voyages & Co. reserves the right to correct pricing errors. Payment terms are confirmed with your specialist at the time of booking." },
    { title: "Cancellations & Refunds", body: "Cancellation and refund terms vary by partner and arrangement. Please refer to our Cancellation Policy for detailed information. Refunds, where applicable, are processed promptly to your original payment method." },
    { title: "Member Responsibilities", body: "You are responsible for ensuring all travel documents (passport, visa, identification) are valid and appropriate for your journey. Voyages & Co. is not liable for issues arising from incorrect or expired documents. You must be at least 18 years old to hold a membership." },
    { title: "Limitation of Liability", body: "Voyages & Co. acts as a curator and intermediary between members and travel partners. We are not responsible for the acts, errors, omissions or negligence of such partners. Our total liability in connection with any arrangement shall not exceed the amount paid for it." },
    { title: "Governing Law", body: "These Terms of Service are governed by the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Pune, Maharashtra." },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
      <div className="mb-10">
        <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-3">{t("legal.eyebrow")}</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-3">{t("terms.title")}</h1>
        <p className="text-ink-faint font-light">{t("legal.lastUpdated")}: June 1, 2026</p>
      </div>

      <p className="text-ink-muted mb-8 leading-relaxed font-light">
        {t("terms.intro")}
      </p>

      <div className="space-y-5">
        {sections.map((s, i) => (
          <div key={s.title} className="bg-panel rounded-2xl border border-line shadow-card p-6">
            <h2 className="font-serif text-lg font-light text-ink mb-3 flex items-center gap-3">
              <span className="w-7 h-7 rounded-full border border-gold/40 text-gold text-xs flex items-center justify-center font-medium shrink-0">{i + 1}</span>
              {s.title}
            </h2>
            <p className="text-sm text-ink-muted leading-relaxed font-light">{s.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 text-sm text-ink-muted font-light">
        <p>{t("terms.contactLine")} <a href="mailto:hello@voyagesco.com" className="text-gold link-underline">hello@voyagesco.com</a></p>
      </div>
    </div>
  );
}
