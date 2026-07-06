"use client";

import { useEffect, useState } from "react";
import { Clock, Phone, ShieldAlert, MessageCircle } from "lucide-react";
import { getEmergency } from "@/lib/emergency";
import { useSetting } from "@/components/providers/SettingsProvider";

// Compact "when you arrive" card: live local time at the destination + the
// emergency numbers that apply there + one-tap concierge. All client-side and
// bundled, so it keeps working offline once the page is cached.
export default function DestinationEssentials({ country, city }: { country: string; city?: string }) {
  const info = getEmergency(country);
  const wa = useSetting("contact.whatsapp") || "919919910213";
  const [now, setNow] = useState<string>("");

  useEffect(() => {
    const tick = () => {
      try {
        setNow(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: info.tz }).format(new Date()));
      } catch { setNow(""); }
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [info.tz]);

  const waText = encodeURIComponent(`Hello, I need assistance with my trip${city ? ` in ${city}` : ""}.`);

  return (
    <div className="border border-line rounded-2xl p-5 bg-panel-soft">
      <p className="text-[11px] tracking-[0.2em] uppercase text-ink-faint mb-4">When you arrive{city ? ` · ${city}` : ""}</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-start gap-2.5">
          <Clock size={16} className="text-gold mt-0.5 shrink-0" />
          <div>
            <p className="text-lg font-serif font-light text-ink leading-none">{now || "—"}</p>
            <p className="text-[11px] text-ink-faint mt-1">Local time</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <ShieldAlert size={16} className="text-gold mt-0.5 shrink-0" />
          <div>
            <p className="text-lg font-serif font-light text-ink leading-none">{info.general}</p>
            <p className="text-[11px] text-ink-faint mt-1">Emergency</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-4 text-xs text-ink-muted">
        <a href={`tel:${info.police}`} className="flex items-center gap-1.5 hover:text-ink"><Phone size={12} /> Police · {info.police}</a>
        <a href={`tel:${info.ambulance}`} className="flex items-center gap-1.5 hover:text-ink"><Phone size={12} /> Ambulance · {info.ambulance}</a>
      </div>
      <a
        href={`https://wa.me/${wa}?text=${waText}`} target="_blank" rel="noopener noreferrer"
        className="mt-4 w-full inline-flex items-center justify-center gap-2 py-2.5 bg-ink text-page text-xs tracking-[0.14em] uppercase rounded-sm hover:bg-ink/90 transition-colors"
      >
        <MessageCircle size={14} /> Message concierge
      </a>
    </div>
  );
}
