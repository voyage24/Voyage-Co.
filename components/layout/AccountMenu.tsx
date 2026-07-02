"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function AccountMenu({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const items = [
    { label: t("account.myAccount"), href: "/account" },
    { label: t("common.myTrips"), href: "/trips" },
    { label: "Trip tools", href: "/tools" },
    { label: "Visa assistance", href: "/visa" },
    { label: "Travel insurance", href: "/insurance" },
  ];

  return (
    <div className="relative group" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={t("account.account")}
        className={`inline-flex items-center justify-center leading-none transition-all duration-200 hover:scale-110 active:scale-95 ${tone === "light" ? "text-white/90 hover:text-white" : "text-ink-muted hover:text-ink"}`}
      >
        <User size={18} />
      </button>
      {!open && (
        <span className="hidden lg:block pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2.5 px-2.5 py-1 bg-vc-950 text-white text-[10px] tracking-[0.12em] uppercase whitespace-nowrap rounded-sm opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 z-[60]">
          {t("account.account")}
        </span>
      )}
      {open && (
        <div className="absolute right-0 mt-3 w-44 bg-panel-raised border border-line shadow-luxury py-1.5 z-[60]">
          {items.map(i => (
            <Link
              key={i.href}
              href={i.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-ink-muted hover:text-ink hover:bg-panel-soft transition-colors"
            >
              {i.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
