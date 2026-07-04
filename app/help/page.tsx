"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Search, Phone, Mail, MessageCircle } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useContent } from "@/components/providers/ContentProvider";

const FAQS = [
  {
    categoryKey: "help.faq.membership.category",
    items: [
      { qKey: "help.faq.membership.q1", aKey: "help.faq.membership.a1" },
      { qKey: "help.faq.membership.q2", aKey: "help.faq.membership.a2" },
      { qKey: "help.faq.membership.q3", aKey: "help.faq.membership.a3" },
    ],
  },
  {
    categoryKey: "help.faq.journeys.category",
    items: [
      { qKey: "help.faq.journeys.q1", aKey: "help.faq.journeys.a1" },
      { qKey: "help.faq.journeys.q2", aKey: "help.faq.journeys.a2" },
      { qKey: "help.faq.journeys.q3", aKey: "help.faq.journeys.a3" },
    ],
  },
  {
    categoryKey: "help.faq.support.category",
    items: [
      { qKey: "help.faq.support.q1", aKey: "help.faq.support.a1" },
      { qKey: "help.faq.support.q2", aKey: "help.faq.support.a2" },
      { qKey: "help.faq.support.q3", aKey: "help.faq.support.a3" },
    ],
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-line last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-4 text-left gap-4">
        <span className="text-sm font-medium text-ink">{q}</span>
        {open ? <ChevronUp size={16} className="text-gold shrink-0" /> : <ChevronDown size={16} className="text-ink-faint shrink-0" />}
      </button>
      {open && <p className="text-sm text-ink-muted pb-4 leading-relaxed font-light">{a}</p>}
    </div>
  );
}

export default function HelpPage() {
  const { t } = useLanguage();
  const c = useContent();
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const filteredFaqs = q
    ? FAQS
        .map(section => ({
          ...section,
          items: section.items.filter(item =>
            t(item.qKey).toLowerCase().includes(q) || t(item.aKey).toLowerCase().includes(q)
          ),
        }))
        .filter(section => section.items.length > 0)
    : FAQS;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
      <div className="text-center mb-10">
        <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-3">{c("help.eyebrow") || t("help.eyebrow")}</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-3">{c("help.title") || t("help.title")}</h1>
        <p className="text-ink-muted font-light">{c("help.subtitle") || t("help.subtitle")}</p>
      </div>

      {/* Search */}
      <div className="relative mb-10">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={t("help.searchPlaceholder")}
          className="w-full pl-12 pr-4 py-4 rounded-sm bg-panel border border-line text-sm text-ink focus:outline-none focus:border-gold transition-colors"
        />
      </div>

      {/* FAQs */}
      <div className="space-y-5 mb-12">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map(section => (
            <div key={section.categoryKey} className="bg-panel rounded-2xl border border-line shadow-card p-6">
              <h2 className="font-serif text-xl font-light text-ink mb-2">{t(section.categoryKey)}</h2>
              {section.items.map(item => (
                <FaqItem key={item.qKey} q={t(item.qKey)} a={t(item.aKey)} />
              ))}
            </div>
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-ink-muted font-light">{t("help.noResultsPrefix")} &ldquo;{query}&rdquo; {t("help.noResultsSuffix")}</p>
          </div>
        )}
      </div>

      {/* Contact options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Phone, title: t("help.callUs"), desc: "+91 99199 10213", sub: t("help.callUsSub"), href: "tel:+919919910213" },
          { icon: MessageCircle, title: t("help.whatsapp"), desc: "+91 99199 10213", sub: t("help.whatsappSub"), href: "https://wa.me/919919910213", external: true },
          { icon: Mail, title: t("help.emailUs"), desc: "hello@voyagesco.com", sub: t("help.emailUsSub"), href: "mailto:hello@voyagesco.com" },
          { icon: MessageCircle, title: t("help.liveConcierge"), desc: t("help.liveConciergeDesc"), sub: t("help.liveConciergeSub"), href: "https://wa.me/919919910213", external: true },
        ].map(c => {
          const Icon = c.icon;
          return (
            <a
              key={c.title}
              href={c.href}
              {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="bg-panel rounded-2xl border border-line shadow-card p-5 text-center hover:border-gold/40 transition-colors"
            >
              <div className="w-10 h-10 rounded-sm border border-gold/30 bg-gold/5 flex items-center justify-center mx-auto mb-3">
                <Icon size={17} className="text-gold" />
              </div>
              <p className="font-medium text-ink text-sm">{c.title}</p>
              <p className="text-sm text-gold font-medium mt-1">{c.desc}</p>
              <p className="text-xs text-ink-faint mt-0.5 font-light">{c.sub}</p>
            </a>
          );
        })}
      </div>

      <div className="text-center mt-10">
        <p className="text-sm text-ink-muted font-light">
          {t("help.lookingForCancellations")}{" "}
          <Link href="/cancellations" className="text-gold link-underline">{t("common.cancellations")}</Link>
        </p>
      </div>
    </div>
  );
}
