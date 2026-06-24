"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";

// Persistent floating action button, visible on every page, that opens a
// WhatsApp chat with the concierge number — the simplest "chatbox" the site
// needs, since live support already happens over WhatsApp (see Help page's
// "Live Concierge" option) rather than through a separate chat platform.
export default function WhatsAppFAB() {
  const { t } = useLanguage();

  return (
    <a
      href="https://wa.me/919919910213"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("help.whatsapp")}
      className="fixed bottom-5 right-5 z-40 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/25 flex items-center justify-center transition-transform duration-200 hover:scale-110 active:scale-95"
    >
      <svg viewBox="0 0 32 32" width="24" height="24" fill="#25D366" aria-hidden="true">
        <path d="M16.004 3C9.4 3 4 8.4 4 15.004c0 2.39.7 4.61 1.92 6.49L4.6 27.4l5.99-1.57a11.94 11.94 0 0 0 5.41 1.28h.01c6.6 0 12-5.4 12-12.01C28 8.4 22.6 3 16.004 3Zm0 21.83h-.01a9.85 9.85 0 0 1-5.02-1.38l-.36-.21-3.55.93.95-3.46-.23-.36a9.84 9.84 0 0 1-1.51-5.36c0-5.43 4.42-9.85 9.86-9.85 2.63 0 5.11 1.03 6.97 2.89a9.78 9.78 0 0 1 2.89 6.97c0 5.43-4.42 9.83-9.99 9.83Zm5.4-7.36c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.66.15-.2.3-.76.96-.93 1.16-.17.2-.34.22-.63.07-1.72-.86-2.85-1.54-3.98-3.49-.3-.52.3-.48.86-1.6.1-.2.05-.37-.05-.52-.1-.15-.66-1.6-.9-2.13-.24-.52-.49-.45-.66-.46-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.07 3.15 5.02 4.29 2.95 1.14 2.95.76 3.48.71.52-.05 1.75-.71 2-1.4.25-.69.25-1.28.17-1.4-.07-.13-.27-.2-.57-.34Z" />
      </svg>
    </a>
  );
}
