"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { LANGUAGES, type Language } from "@/lib/languages";
import { DICTIONARIES, EN } from "@/lib/i18n/dictionaries";

interface LanguageContextValue {
  language: Language;
  setLanguageCode: (code: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);
const STORAGE_KEY = "vc-language";

// Languages whose script reads right-to-left. Without flipping document
// direction, flex rows (icon+text, badges, nav) keep their LTR visual order
// while the text itself shapes right-to-left, producing the misaligned
// layout reported when switching to these languages.
const RTL_CODES = new Set(["ar", "he", "fa", "ur"]);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [code, setCode] = useState("en");

  // Load once on the client (avoids SSR/CSR mismatch).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && LANGUAGES.some(l => l.code === saved)) setCode(saved);
    } catch {}
  }, []);

  // Keep <html dir/lang> in sync so flex layouts, text-align and gap order
  // mirror correctly for RTL scripts instead of staying LTR underneath RTL text.
  useEffect(() => {
    document.documentElement.dir = RTL_CODES.has(code) ? "rtl" : "ltr";
    document.documentElement.lang = code;
  }, [code]);

  const setLanguageCode = useCallback((c: string) => {
    setCode(c);
    try { localStorage.setItem(STORAGE_KEY, c); } catch {}
  }, []);

  const language = useMemo(() => LANGUAGES.find(l => l.code === code) ?? LANGUAGES[0], [code]);

  // Looks up a flat dot-notation key (e.g. "hero.headline1") in the current
  // language's dictionary, falling back to English, then to the key itself
  // so a missing translation never renders as blank.
  const t = useCallback((key: string) => {
    const dict = DICTIONARIES[language.code];
    return dict?.[key] ?? EN[key] ?? key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguageCode, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
