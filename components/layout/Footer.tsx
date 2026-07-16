"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { readRememberedContact } from "@/components/providers/useContactDefaults";
import { useSetting, useSettings } from "@/components/providers/SettingsProvider";
import { useContent, useContentList } from "@/components/providers/ContentProvider";
import TurnstileWidget from "@/components/ui/TurnstileWidget";

type FooterLink = { href: string; key?: string; label?: string };

// The footer, grouped by what a visitor is actually trying to do: browse the
// catalogue (Discover), plan a trip (Plan), read about us (Maison), or get help
// (Care). `id` doubles as the admin "column" label a footer-list item files
// itself under; `fallback` covers headings with no translation yet, since t()
// echoes an unknown key back.
type FooterColumn = { id: string; headingKey: string; contentKey: string; fallback: string; links: FooterLink[] };

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    id: "discover", headingKey: "footer.discover", contentKey: "footer.colDiscover", fallback: "Discover",
    links: [
      { key: "common.destinations",   href: "/packages" },
      { key: "common.stays",          href: "/hotels" },
      { key: "common.cruises",        href: "/cruises" },
      { key: "common.experiences",    href: "/experiences" },
      { key: "common.privateFlights", href: "/flights" },
      { key: "common.byDestination",  href: "/destinations" },
      { key: "explore.title",         href: "/explore" },
      { key: "common.offers",         href: "/offers" },
    ],
  },
  {
    // Planning tools were scattered across the other columns; gathered here.
    id: "plan", headingKey: "footer.plan", contentKey: "footer.colPlan", fallback: "Plan",
    links: [
      { label: "Smart Trip Planner",  href: "/plan" },
      { label: "Group trips",         href: "/groups" },
      { key: "common.tripBuilder",    href: "/itinerary" },
      { key: "common.findJourney",    href: "/quiz" },
      { label: "Trip tools",          href: "/tools" },
      { label: "Live flight tracker", href: "/tools/flight-tracker" },
    ],
  },
  {
    id: "maison", headingKey: "footer.maison", contentKey: "footer.colMaison", fallback: "Maison",
    links: [
      { key: "common.about",      href: "/about" },
      { key: "common.journal",    href: "/blog" },
      { key: "common.press",      href: "/press" },
      { key: "common.careers",    href: "/careers" },
      { key: "common.partners",   href: "/partners" },
      { label: "Events",          href: "/events" },
      { key: "common.membership", href: "/membership" },
    ],
  },
  {
    id: "care", headingKey: "footer.care", contentKey: "footer.colCare", fallback: "Care",
    links: [
      { key: "common.concierge",         href: "/contact" },
      { key: "common.conciergeServices", href: "/services" },
      { key: "common.requestCallback",   href: "/callback" },
      { key: "common.giftJourney",       href: "/gift" },
      { label: "Visa assistance",        href: "/visa" },
      { label: "Travel insurance",       href: "/insurance" },
      { key: "common.faq",               href: "/faq" },
      { label: "Support",                href: "/support" },
      { key: "common.cancellations",     href: "/cancellations" },
    ],
  },
];

// Legal sits with the copyright, not among the help links.
const LEGAL: FooterLink[] = [
  { key: "common.privacy", href: "/privacy" },
  { key: "common.terms",   href: "/terms" },
];

const SOCIAL = [
  { label: "footer.instagram", key: "social.instagram" as const },
  { label: "footer.pinterest", key: "social.pinterest" as const },
  { label: "footer.linkedin", key: "social.linkedin" as const },
];

export default function Footer() {
  const { t, language } = useLanguage();
  const c = useContent();
  const footerList = useContentList("list.footer");
  // A saved footer list replaces the default links; otherwise use the shipped
  // links with their translated labels. Columns with nothing in them are dropped
  // so a custom list can't leave an empty heading behind.
  const columns = FOOTER_COLUMNS.map(col => ({
    ...col,
    links: footerList
      ? footerList.filter(x => (x.column || "").trim().toLowerCase() === col.id).map(x => ({ href: x.href || "#", label: x.label || "" }))
      : col.links.map(l => ({ href: l.href, label: l.label ?? t(l.key ?? "") })),
  })).filter(col => col.links.length > 0);

  // Admin override wins; then the translation; then the shipped English label
  // (t() hands back the key itself when a heading isn't translated yet).
  const headingFor = (col: FooterColumn) => {
    const override = c(col.contentKey);
    if (override) return override;
    const translated = t(col.headingKey);
    return translated === col.headingKey ? col.fallback : translated;
  };
  const phone = useSetting("contact.phone") || "+91 99199 10213";
  const whatsapp = useSetting("contact.whatsapp") || "919919910213";
  const settings = useSettings();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  // Prefill from the guest's remembered email (on-device only; no network).
  useEffect(() => { const r = readRememberedContact(); if (r?.email) setEmail(e => e || r.email); }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, language: language.code, turnstileToken: token }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <footer className="bg-page border-t border-line">
      {/* Newsletter */}
      <div className="max-w-3xl mx-auto px-6 py-24 text-center border-b border-line">
        <p className="text-[11px] tracking-[0.32em] uppercase text-gold mb-6">{c("footer.stayInTouch") || t("footer.stayInTouch")}</p>
        <h2 className="font-serif font-light text-ink text-3xl sm:text-4xl mb-8 leading-snug">
          {c("footer.dispatchLine1") || t("footer.dispatchLine1")}<br className="hidden sm:block" /> {c("footer.dispatchLine2") || t("footer.dispatchLine2")}
        </h2>
        {status === "success" ? (
          <p className="text-sm text-ink-muted max-w-md mx-auto">{t("footer.subscribeSuccess")}</p>
        ) : (
          <form onSubmit={handleSubscribe} className="flex items-center max-w-md mx-auto border-b border-line-strong focus-within:border-ink transition-colors">
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={c("footer.emailPlaceholder") || t("footer.emailPlaceholder")}
              className="flex-1 bg-transparent py-3 text-sm text-ink placeholder:text-ink-faint outline-none"
            />
            <button
              type="submit"
              disabled={status === "loading" || (!!email && !token)}
              className="text-[11px] tracking-[0.22em] uppercase text-ink hover:text-gold transition-colors pl-4 disabled:opacity-50"
            >
              {status === "loading" ? t("footer.subscribing") : (c("footer.subscribe") || t("footer.subscribe"))}
            </button>
          </form>
        )}
        {/* Bot check appears only once the visitor starts entering an email. */}
        {status !== "success" && email && (
          <div className="mt-4 flex justify-center"><TurnstileWidget onToken={setToken} /></div>
        )}
        {status === "error" && (
          <p className="text-sm text-red-600 max-w-md mx-auto mt-3">{t("footer.subscribeError")}</p>
        )}
      </div>

      {/* Links */}
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12 py-20">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Logo size={26} className="mb-5" />
            <p className="text-sm text-ink-muted leading-relaxed font-light max-w-xs">
              {c("footer.tagline") || t("footer.tagline")}
            </p>
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-5 text-sm text-ink-muted hover:text-ink transition-all duration-200 font-light hover:scale-110 active:scale-95 origin-left"
            >
              <MessageCircle size={15} className="text-gold" />
              {t("help.whatsapp")} {phone}
            </a>
          </div>

          {columns.map(col => (
            <div key={col.id}>
              <h3 className="text-[10px] font-normal tracking-[0.24em] uppercase text-ink-faint mb-5">{headingFor(col)}</h3>
              <ul className="space-y-3">
                {col.links.map((link, i) => (
                  <li key={`${link.href}-${i}`}>
                    <Link href={link.href} className="inline-block text-sm text-ink-muted hover:text-ink transition-all duration-200 font-light hover:scale-110 active:scale-95 origin-left">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 order-2 sm:order-1">
            <p className="text-xs text-ink-faint font-light tracking-wide">
              {c("footer.copyright") || "© 2026 Voyages & Co. (by Lighthouse Ventures) · voyagesco.com"}
            </p>
            <span className="hidden sm:inline text-ink-faint/40 text-xs">·</span>
            {LEGAL.map(l => (
              <Link key={l.href} href={l.href} className="text-xs text-ink-faint font-light hover:text-ink transition-colors">
                {l.label ?? t(l.key ?? "")}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-6 order-1 sm:order-2">
            {SOCIAL.map(s => {
              const url = settings?.[s.key];
              return (
                <a key={s.key} href={url || "#"} target={url ? "_blank" : undefined} rel={url ? "noopener noreferrer" : undefined} className="inline-block text-[10px] tracking-[0.2em] uppercase text-ink-muted hover:text-ink transition-all duration-200 hover:scale-110 active:scale-95">
                  {t(s.label)}
                </a>
              );
            })}
          </div>
        </div>

        {/* Development / non-commercial disclaimer — shown site-wide. */}
        <p className="mt-6 text-[10px] leading-relaxed text-ink-faint/80 font-light max-w-4xl">
          {c("footer.disclaimer") || "This website is a demonstration / portfolio project under development and is not a live commercial travel service. All properties, journeys, prices, availability and imagery are illustrative only — no bookings are fulfilled and no payments are taken. Any trademarks, brand names or images remain the property of their respective owners and are used here for non-commercial demonstration purposes only."}
        </p>
      </div>
    </footer>
  );
}
