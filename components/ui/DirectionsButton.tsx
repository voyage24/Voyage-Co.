"use client";

import { Navigation } from "lucide-react";
import { haptic } from "@/lib/haptics";

// One-tap directions: opens the platform maps app (Google Maps universal link
// works on Android, iOS and web; iOS offers Apple Maps from there).
export default function DirectionsButton({ lat, lng, name, label = "Directions" }: { lat: number; lng: number; name?: string; label?: string }) {
  const dest = name ? `${encodeURIComponent(name)}` : `${lat},${lng}`;
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${dest}`;
  return (
    <a
      href={url} target="_blank" rel="noopener noreferrer" onClick={() => haptic("select")}
      className="inline-flex items-center gap-2 text-xs tracking-[0.12em] uppercase text-ink-muted hover:text-ink transition-colors"
    >
      <Navigation size={15} /> {label}
    </a>
  );
}
