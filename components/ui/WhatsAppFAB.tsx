"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useSetting } from "@/components/providers/SettingsProvider";

// Persistent floating action button, visible on every page, that opens a
// WhatsApp chat with the concierge number — the simplest "chatbox" the site
// needs, since live support already happens over WhatsApp (see Help page's
// "Live Concierge" option) rather than through a separate chat platform.
export default function WhatsAppFAB() {
  const { t } = useLanguage();
  const wa = useSetting("contact.whatsapp") || "919919910213";

  return (
    <a
      href={`https://wa.me/${wa}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("help.whatsapp")}
      className="fixed bottom-5 right-5 z-40 w-9 h-9 flex items-center justify-center transition-transform duration-200 hover:scale-110 active:scale-95"
    >
      <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true">
        <circle cx="16" cy="16" r="16" fill="#25D366" />
        <path fill="#fff" d="M16.004 6.5c-5.25 0-9.5 4.26-9.5 9.5 0 1.8.5 3.48 1.36 4.92l-1.42 4.58 4.72-1.39a9.46 9.46 0 0 0 4.84 1.32h.01c5.25 0 9.5-4.25 9.5-9.43 0-5.25-4.25-9.5-9.5-9.5Zm0 17.33h-.01a7.85 7.85 0 0 1-4.02-1.1l-.29-.17-2.84.74.76-2.77-.19-.29a7.84 7.84 0 0 1-1.21-4.27c0-4.34 3.53-7.86 7.87-7.86 2.1 0 4.08.82 5.57 2.31a7.79 7.79 0 0 1 2.3 5.55c0 4.34-3.53 7.86-7.94 7.86Zm4.3-5.88c-.24-.12-1.4-.69-1.62-.77-.21-.08-.37-.12-.53.12-.16.24-.61.77-.74.93-.14.16-.27.18-.5.06-1.38-.69-2.28-1.23-3.18-2.79-.24-.42.24-.39.69-1.28.08-.16.04-.3-.04-.42-.08-.12-.53-1.28-.72-1.7-.19-.42-.39-.36-.53-.37-.14-.01-.3-.01-.46-.01-.16 0-.42.06-.64.3-.22.24-.83.81-.83 1.99 0 1.17.85 2.31.97 2.47.12.16 1.66 2.52 4.02 3.43 2.36.91 2.36.61 2.78.57.42-.04 1.4-.57 1.6-1.12.2-.55.2-1.02.14-1.12-.06-.1-.22-.16-.45-.27Z" />
      </svg>
    </a>
  );
}
