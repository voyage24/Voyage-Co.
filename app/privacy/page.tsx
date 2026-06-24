"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";

export default function PrivacyPage() {
  const { t } = useLanguage();
  const sections = [
    { title: "Information We Collect", body: "We collect information you provide directly to us, such as when you apply for membership, plan a journey, or contact your concierge. This includes your name, email address, phone number, payment information, and travel preferences. We also collect certain information automatically when you use our services, such as your IP address, browser type, device information, and usage data." },
    { title: "How We Use Your Information", body: "We use the information we collect to craft and arrange your journeys, communicate confirmations and itineraries, provide concierge support, personalise your experience, share occasional updates (which you may opt out of at any time), improve our services, and comply with legal obligations." },
    { title: "Information Sharing", body: "We share your information only with the travel partners (airlines, hotels, villas, experience curators) necessary to fulfil your journey, and with payment processors to complete transactions. We never sell your personal data to third parties. Discretion is fundamental to who we are." },
    { title: "Data Security", body: "We implement industry-standard security measures including 256-bit SSL encryption, PCI DSS compliance for payment data, regular security audits, and strict access controls to protect your personal information from unauthorised access, disclosure, or misuse." },
    { title: "Cookies", body: "We use cookies and similar technologies to improve your experience. You can control cookie settings through your browser. Note that disabling cookies may affect some functionality of our site." },
    { title: "Your Rights", body: "You have the right to access, correct, or delete your personal data, and to object to or restrict certain processing. To exercise these rights, contact us at privacy@voyagesco.com. We will respond within 30 days." },
    { title: "Changes to This Policy", body: "We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through a notice on our website. Continued use of our services after changes constitutes acceptance of the updated policy." },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
      <div className="mb-10">
        <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-3">{t("legal.eyebrow")}</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-3">{t("privacy.title")}</h1>
        <p className="text-ink-faint font-light">{t("legal.lastUpdated")}: June 1, 2026</p>
      </div>

      <p className="text-ink-muted mb-8 leading-relaxed font-light">
        {t("privacy.intro")}
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
        <p>{t("privacy.contactLine")} <a href="mailto:privacy@voyagesco.com" className="text-gold link-underline">privacy@voyagesco.com</a></p>
      </div>
    </div>
  );
}
