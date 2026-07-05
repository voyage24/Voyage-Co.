import type { Metadata } from "next";
import {
  Plane, ChefHat, Ship, UtensilsCrossed, Camera, ShieldCheck, Car, Sparkles,
  Gift, Star, Globe, Heart, MapPin, Wine, Music, Compass, Users, Bell, type LucideIcon,
} from "lucide-react";
import ServiceRequestForm from "@/components/services/ServiceRequestForm";
import Reveal from "@/components/ui/Reveal";
import { getPageContent } from "@/lib/page-content";
import { getPageList } from "@/lib/page-lists";

export const metadata: Metadata = {
  title: "Concierge Services — Voyages & Co.",
  description: "Private transfers, personal chefs, yacht & jet charter, restaurant reservations and more — arranged by our concierge.",
};

// Icons are stored by Lucide name so admins can pick one without code changes.
const ICONS: Record<string, LucideIcon> = {
  Plane, ChefHat, Ship, UtensilsCrossed, Camera, ShieldCheck, Car, Sparkles,
  Gift, Star, Globe, Heart, MapPin, Wine, Music, Compass, Users, Bell,
};

export default async function ServicesPage() {
  const c = await getPageContent();
  const services = await getPageList("list.services");
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <div className="text-center mb-12">
        <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-3">{c("services.eyebrow")}</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-4">{c("services.title")}</h1>
        <p className="text-ink-muted font-light max-w-xl mx-auto">{c("services.intro")}</p>
      </div>

      <Reveal soft className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
        {services.map((s, i) => {
          const Icon = ICONS[s.icon] ?? Sparkles;
          return (
            <a key={`${s.title}-${i}`} href="#request" className="group bg-panel border border-line rounded-2xl p-6 hover:border-gold/40 transition-colors">
              <Icon size={22} className="text-gold mb-4" />
              <h3 className="font-serif text-lg font-light text-ink mb-1.5">{s.title}</h3>
              <p className="text-sm text-ink-muted font-light leading-relaxed">{s.text}</p>
            </a>
          );
        })}
      </Reveal>

      <ServiceRequestForm services={services.map(s => s.title)} />
    </div>
  );
}
