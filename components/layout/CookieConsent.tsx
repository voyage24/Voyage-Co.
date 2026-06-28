"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/providers/LanguageProvider";

const STORAGE_KEY = "vc-cookie-consent";

export default function CookieConsent() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setShow(true);
    } catch {
      /* ignore */
    }
  }, []);

  const accept = () => {
    try { localStorage.setItem(STORAGE_KEY, new Date().toISOString()); } catch { /* ignore */ }
    setShow(false);
  };

  if (!show || pathname?.startsWith("/admin")) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-50 bg-panel-raised border border-line shadow-luxury p-5">
      <p className="text-sm text-ink-muted font-light leading-relaxed mb-4">
        {t("cookie.message")}{" "}
        <Link href="/privacy" className="text-gold underline">{t("cookie.privacy")}</Link>
      </p>
      <button
        onClick={accept}
        className="w-full sm:w-auto px-6 py-2.5 bg-ink hover:bg-ink/90 text-page text-xs tracking-[0.14em] uppercase rounded-sm transition-colors"
      >
        {t("cookie.accept")}
      </button>
    </div>
  );
}
