import type { Metadata } from "next";
import { Plane, ChefHat, Ship, UtensilsCrossed, Camera, ShieldCheck, Car, Sparkles } from "lucide-react";
import ServiceRequestForm from "@/components/services/ServiceRequestForm";
import Reveal from "@/components/ui/Reveal";
import { getPageContent } from "@/lib/page-content";

export const metadata: Metadata = {
  title: "Concierge Services — Voyages & Co.",
  description: "Private transfers, personal chefs, yacht & jet charter, restaurant reservations and more — arranged by our concierge.",
};

const SERVICES = [
  { icon: Car, title: "Private Transfers", text: "Chauffeured arrivals, departures and door-to-door transport in every city." },
  { icon: Plane, title: "Private Jet & Helicopter", text: "Seamless private aviation, scenic transfers and last-mile lifts." },
  { icon: Ship, title: "Yacht & Boat Charter", text: "Crewed yachts and day boats for coastlines, islands and celebrations." },
  { icon: ChefHat, title: "Private Chef & Dining", text: "In-villa chefs, tasting menus and bespoke culinary experiences." },
  { icon: UtensilsCrossed, title: "Restaurant Reservations", text: "Tables at the most coveted restaurants, secured on your behalf." },
  { icon: Camera, title: "Photographer & Videographer", text: "Capture your journey with a private photographer at any destination." },
  { icon: ShieldCheck, title: "Security & Staff", text: "Discreet close protection, butlers, nannies and personal assistants." },
  { icon: Sparkles, title: "Bespoke Requests", text: "Proposals, surprises, access and the impossible — simply ask." },
];

export default async function ServicesPage() {
  const c = await getPageContent();
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <div className="text-center mb-12">
        <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-3">{c("services.eyebrow")}</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-4">{c("services.title")}</h1>
        <p className="text-ink-muted font-light max-w-xl mx-auto">{c("services.intro")}</p>
      </div>

      <Reveal soft className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
        {SERVICES.map(s => (
          <a key={s.title} href="#request" className="group bg-panel border border-line rounded-2xl p-6 hover:border-gold/40 transition-colors">
            <s.icon size={22} className="text-gold mb-4" />
            <h3 className="font-serif text-lg font-light text-ink mb-1.5">{s.title}</h3>
            <p className="text-sm text-ink-muted font-light leading-relaxed">{s.text}</p>
          </a>
        ))}
      </Reveal>

      <ServiceRequestForm services={SERVICES.map(s => s.title)} />
    </div>
  );
}
