"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { useLanguage } from "@/components/providers/LanguageProvider";

const FOOTER_LINKS = {
  "footer.discover": [
    { key: "common.destinations",   href: "/packages" },
    { key: "common.stays",          href: "/hotels" },
    { key: "common.cruises",        href: "/cruises" },
    { key: "common.experiences",    href: "/experiences" },
    { key: "common.privateFlights", href: "/flights" },
  ],
  "footer.maison": [
    { key: "common.about",    href: "/about" },
    { key: "common.journal",  href: "/blog" },
    { key: "common.careers",  href: "/careers" },
    { key: "common.press",    href: "/press" },
    { key: "common.partners", href: "/partners" },
  ],
  "footer.care": [
    { key: "common.concierge",     href: "/contact" },
    { key: "common.help",          href: "/help" },
    { key: "common.cancellations", href: "/cancellations" },
    { key: "common.privacy",       href: "/privacy" },
    { key: "common.terms",         href: "/terms" },
  ],
};

const SOCIAL = ["footer.instagram", "footer.pinterest", "footer.linkedin"];

export default function Footer() {
  const { t, language } = useLanguage();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, language: language.code }),
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
        <p className="text-[11px] tracking-[0.32em] uppercase text-gold mb-6">{t("footer.stayInTouch")}</p>
        <h2 className="font-serif font-light text-ink text-3xl sm:text-4xl mb-8 leading-snug">
          {t("footer.dispatchLine1")}<br className="hidden sm:block" /> {t("footer.dispatchLine2")}
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
              placeholder={t("footer.emailPlaceholder")}
              className="flex-1 bg-transparent py-3 text-sm text-ink placeholder:text-ink-faint outline-none"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="text-[11px] tracking-[0.22em] uppercase text-ink hover:text-gold transition-colors pl-4 disabled:opacity-50"
            >
              {status === "loading" ? t("footer.subscribing") : t("footer.subscribe")}
            </button>
          </form>
        )}
        {status === "error" && (
          <p className="text-sm text-red-600 max-w-md mx-auto mt-3">{t("footer.subscribeError")}</p>
        )}
      </div>

      {/* Links */}
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Logo size={26} className="mb-5" />
            <p className="text-sm text-ink-muted leading-relaxed font-light max-w-xs">
              {t("footer.tagline")}
            </p>
            <a
              href="https://wa.me/919919910213"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-5 text-sm text-ink-muted hover:text-ink transition-all duration-200 font-light hover:scale-110 active:scale-95 origin-left"
            >
              <MessageCircle size={15} className="text-gold" />
              {t("help.whatsapp")} +91 99199 10213
            </a>
          </div>

          {Object.entries(FOOTER_LINKS).map(([headingKey, links]) => (
            <div key={headingKey}>
              <h3 className="text-[10px] font-normal tracking-[0.24em] uppercase text-ink-faint mb-5">{t(headingKey)}</h3>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className="inline-block text-sm text-ink-muted hover:text-ink transition-all duration-200 font-light hover:scale-110 active:scale-95 origin-left">
                      {t(link.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-5">
          <p className="text-xs text-ink-faint font-light tracking-wide order-2 sm:order-1">
            © 2026 Voyages &amp; Co. (by Lighthouse Ventures) · voyagesco.com
          </p>
          <div className="flex items-center gap-6 order-1 sm:order-2">
            {SOCIAL.map(s => (
              <a key={s} href="#" className="inline-block text-[10px] tracking-[0.2em] uppercase text-ink-muted hover:text-ink transition-all duration-200 hover:scale-110 active:scale-95">
                {t(s)}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
