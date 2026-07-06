"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { haptic } from "@/lib/haptics";

type Item = { type: string; id: string; title: string; location: string; image: string; category: string; href: string; km: number };

export default function NearMePage() {
  const [status, setStatus] = useState<"idle" | "locating" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [stays, setStays] = useState<Item[]>([]);
  const [experiences, setExperiences] = useState<Item[]>([]);

  const locate = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) { setStatus("error"); setError("Location isn't available on this device."); return; }
    setStatus("locating"); setError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setStatus("loading");
        try {
          const res = await fetch(`/api/content/near?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`);
          const d = await res.json();
          setStays(d.stays || []); setExperiences(d.experiences || []);
          haptic("success");
          setStatus("done");
        } catch { setStatus("error"); setError("Couldn't load nearby places. Please try again."); }
      },
      () => { setStatus("error"); setError("We couldn't get your location. Please allow location access and try again."); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const Card = ({ item }: { item: Item }) => (
    <Link href={item.href} className="group block rounded-2xl border border-line overflow-hidden hover:shadow-luxury transition-shadow">
      <div className="relative aspect-[4/3]">
        <Image src={item.image} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, 33vw" />
        <span className="absolute top-3 left-3 text-[10px] tracking-[0.12em] uppercase bg-page/90 text-ink px-2.5 py-1 rounded-full">{item.km} km away</span>
      </div>
      <div className="p-4">
        <p className="text-[10px] tracking-[0.16em] uppercase text-gold mb-1">{item.category}</p>
        <p className="font-serif text-lg font-light text-ink truncate">{item.title}</p>
        <p className="text-xs text-ink-faint font-light mt-0.5 flex items-center gap-1"><MapPin size={12} /> {item.location}</p>
      </div>
    </Link>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
      <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-2">Near me</p>
      <h1 className="font-serif text-3xl sm:text-4xl font-light text-ink mb-3">What&apos;s around you</h1>
      <p className="text-ink-muted font-light mb-8 max-w-lg">Discover rare stays and private experiences closest to where you are right now.</p>

      {status === "idle" && (
        <button onClick={locate} className="inline-flex items-center gap-2 px-7 py-3.5 bg-ink text-page text-xs tracking-[0.16em] uppercase rounded-sm hover:bg-ink/90 transition-colors">
          <Navigation size={15} /> Use my location
        </button>
      )}
      {(status === "locating" || status === "loading") && (
        <p className="flex items-center gap-2 text-ink-muted"><Loader2 size={16} className="animate-spin text-gold" /> {status === "locating" ? "Finding you…" : "Loading nearby places…"}</p>
      )}
      {status === "error" && (
        <div>
          <p className="text-sm text-red-600 font-light mb-4">{error}</p>
          <button onClick={locate} className="text-xs tracking-[0.14em] uppercase text-gold link-underline">Try again</button>
        </div>
      )}

      {status === "done" && (
        <div className="space-y-12">
          {stays.length > 0 && (
            <section>
              <h2 className="font-serif text-2xl font-light text-ink mb-5">Stays near you</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{stays.map(s => <Card key={s.id} item={s} />)}</div>
            </section>
          )}
          {experiences.length > 0 && (
            <section>
              <h2 className="font-serif text-2xl font-light text-ink mb-5">Experiences near you</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{experiences.map(e => <Card key={e.id} item={e} />)}</div>
            </section>
          )}
          {stays.length === 0 && experiences.length === 0 && (
            <p className="text-ink-muted font-light">Nothing mapped near you yet — explore our full collection instead.</p>
          )}
        </div>
      )}
    </div>
  );
}
