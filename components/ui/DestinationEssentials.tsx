"use client";

import { useEffect, useState } from "react";
import { Clock, Phone, ShieldAlert, MessageCircle, Siren } from "lucide-react";
import { getEmergency } from "@/lib/emergency";
import { useSetting } from "@/components/providers/SettingsProvider";
import { haptic } from "@/lib/haptics";

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
  const [sos, setSos] = useState(false);

  const triggerSos = () => {
    haptic("error");
    setSos(true);
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const map = `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
          const text = encodeURIComponent(`🚨 EMERGENCY — I need urgent help${city ? ` in ${city}` : ""}. My location: ${map}`);
          window.open(`https://wa.me/${wa}?text=${text}`, "_blank");
        },
        () => {
          const text = encodeURIComponent(`🚨 EMERGENCY — I need urgent help${city ? ` in ${city}` : ""}. (Location unavailable.)`);
          window.open(`https://wa.me/${wa}?text=${text}`, "_blank");
        },
        { enableHighAccuracy: true, timeout: 8000 },
      );
    }
  };

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

      {!sos ? (
        <button
          onClick={triggerSos}
          className="mt-2 w-full inline-flex items-center justify-center gap-2 py-2.5 border border-red-300 text-red-600 text-xs tracking-[0.14em] uppercase rounded-sm hover:bg-red-50 transition-colors"
        >
          <Siren size={14} /> Emergency SOS
        </button>
      ) : (
        <div className="mt-2 rounded-sm border border-red-300 bg-red-50 p-3">
          <p className="text-[11px] text-red-700 mb-2">Your location was sent to the concierge. Call emergency services if you need immediate help:</p>
          <a href={`tel:${info.general}`} className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white text-xs tracking-[0.14em] uppercase rounded-sm hover:bg-red-700 transition-colors">
            <Phone size={14} /> Call {info.general}
          </a>
        </div>
      )}
    </div>
  );
}
