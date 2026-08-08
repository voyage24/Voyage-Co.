"use client";

import { useEffect, useRef, useState } from "react";
import { Compass, CalendarCheck, Headset, PhoneCall } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useSetting } from "@/components/providers/SettingsProvider";
import { useShowOnScroll } from "@/lib/useShowOnScroll";

// Four common reasons a visitor reaches for WhatsApp, each opening the chat
// with a relevant message already typed in — faster than starting from a
// blank chat and typing out the context themselves every time.
const QUICK_OPTIONS = [
  { labelKey: "whatsappMenu.planTrip", textKey: "whatsappMenu.planTripMsg", icon: Compass },
  { labelKey: "whatsappMenu.myBooking", textKey: "whatsappMenu.myBookingMsg", icon: CalendarCheck },
  { labelKey: "whatsappMenu.concierge", textKey: "whatsappMenu.conciergeMsg", icon: Headset },
  { labelKey: "whatsappMenu.callback", textKey: "whatsappMenu.callbackMsg", icon: PhoneCall },
] as const;

// Floating WhatsApp launcher — tapping it opens a small quick-menu of common
// reasons to get in touch, each pre-filling the chat with that context,
// instead of dropping the visitor into a blank chat every time. Stays hidden
// at rest and only slides in from the right corner while the user is
// scrolling (or while the menu itself is open), so it never distracts.
export default function WhatsAppFAB() {
  const { t } = useLanguage();
  const wa = useSetting("contact.whatsapp") || "919919910213";
  const show = useShowOnScroll();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div
      ref={ref}
      className={`fixed bottom-[5.25rem] right-4 sm:bottom-5 sm:right-5 z-40 transition-[transform,opacity] duration-500 ease-out ${show || open ? "translate-x-0 opacity-100" : "translate-x-[150%] opacity-0 pointer-events-none"}`}
    >
      {open && (
        <div className="absolute bottom-full right-0 mb-3 w-64 bg-panel-raised border border-line rounded-xl shadow-luxury overflow-hidden animate-slide-up">
          <p className="px-4 pt-3 pb-2 text-[10px] tracking-[0.14em] uppercase text-ink-faint">{t("whatsappMenu.title")}</p>
          {QUICK_OPTIONS.map(opt => {
            const Icon = opt.icon;
            return (
              <a
                key={opt.labelKey}
                href={`https://wa.me/${wa}?text=${encodeURIComponent(t(opt.textKey))}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-ink hover:bg-panel-soft transition-colors border-t border-line first:border-t-0"
              >
                <Icon size={16} className="text-[#25D366] shrink-0" />
                {t(opt.labelKey)}
              </a>
            );
          })}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-label={t("help.whatsapp")}
        aria-expanded={open}
        className="w-11 h-11 sm:w-10 sm:h-10 flex items-center justify-center drop-shadow-md hover:scale-110 transition-transform"
      >
        <svg viewBox="0 0 32 32" className="w-full h-full" aria-hidden="true">
          <defs>
            <clipPath id="waClip"><circle cx="16" cy="16" r="16" /></clipPath>
            <linearGradient id="waGleam" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.6" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g clipPath="url(#waClip)">
            <circle cx="16" cy="16" r="16" fill="#25D366" />
            <path fill="#fff" d="M16.004 6.5c-5.25 0-9.5 4.26-9.5 9.5 0 1.8.5 3.48 1.36 4.92l-1.42 4.58 4.72-1.39a9.46 9.46 0 0 0 4.84 1.32h.01c5.25 0 9.5-4.25 9.5-9.43 0-5.25-4.25-9.5-9.5-9.5Zm0 17.33h-.01a7.85 7.85 0 0 1-4.02-1.1l-.29-.17-2.84.74.76-2.77-.19-.29a7.84 7.84 0 0 1-1.21-4.27c0-4.34 3.53-7.86 7.87-7.86 2.1 0 4.08.82 5.57 2.31a7.79 7.79 0 0 1 2.3 5.55c0 4.34-3.53 7.86-7.94 7.86Zm4.3-5.88c-.24-.12-1.4-.69-1.62-.77-.21-.08-.37-.12-.53.12-.16.24-.61.77-.74.93-.14.16-.27.18-.5.06-1.38-.69-2.28-1.23-3.18-2.79-.24-.42.24-.39.69-1.28.08-.16.04-.3-.04-.42-.08-.12-.53-1.28-.72-1.7-.19-.42-.39-.36-.53-.37-.14-.01-.3-.01-.46-.01-.16 0-.42.06-.64.3-.22.24-.83.81-.83 1.99 0 1.17.85 2.31.97 2.47.12.16 1.66 2.52 4.02 3.43 2.36.91 2.36.61 2.78.57.42-.04 1.4-.57 1.6-1.12.2-.55.2-1.02.14-1.12-.06-.1-.22-.16-.45-.27Z" />
            <rect y="-8" width="9" height="48" fill="url(#waGleam)" transform="skewX(-20)">
              <animate attributeName="x" values="-16;46" dur="3s" repeatCount="indefinite" />
            </rect>
          </g>
          <circle cx="16" cy="16" r="15" fill="none" stroke="#c9ae77" strokeWidth="1.1" />
        </svg>
      </button>
    </div>
  );
}
