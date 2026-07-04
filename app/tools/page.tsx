import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftRight, Luggage, ListChecks, FileText, ShieldCheck, Sparkles, Plane } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { getPageContent } from "@/lib/page-content";

export const metadata: Metadata = {
  title: "Trip Tools & Travel Services — Voyages & Co.",
  description: "Currency converter, smart packing list, travel checklist, visa assistance and travel insurance — everything for a seamless journey.",
};

const TOOLS = [
  { icon: Plane, title: "Live flight tracker", text: "Follow any flight live on the world map.", href: "/tools/flight-tracker" },
  { icon: ArrowLeftRight, title: "Currency converter", text: "Live rates across 40+ currencies.", href: "/tools/currency" },
  { icon: Luggage, title: "Smart packing list", text: "A tailored list from your trip details.", href: "/tools/packing" },
  { icon: ListChecks, title: "Travel checklist", text: "A countdown of everything to sort before you go.", href: "/tools/checklist" },
  { icon: ShieldCheck, title: "Visa assistance", text: "Guidance and support for entry requirements.", href: "/visa" },
  { icon: FileText, title: "Travel insurance", text: "Cover for medical, cancellation and baggage.", href: "/insurance" },
  { icon: Sparkles, title: "Concierge services", text: "Transfers, chefs, charters — anything, arranged.", href: "/services" },
];

export default async function ToolsHubPage() {
  const c = await getPageContent();
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <div className="text-center mb-12">
        <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-3">{c("tools.eyebrow")}</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-4">{c("tools.title")}</h1>
        <p className="text-ink-muted font-light max-w-xl mx-auto">{c("tools.intro")}</p>
      </div>

      <Reveal soft className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOOLS.map(tl => (
          <Link key={tl.href} href={tl.href} className="group bg-panel border border-line rounded-2xl p-6 hover:border-gold/40 hover:-translate-y-1 transition-all">
            <tl.icon size={22} className="text-gold mb-4" />
            <h3 className="font-serif text-lg font-light text-ink mb-1.5">{tl.title}</h3>
            <p className="text-sm text-ink-muted font-light leading-relaxed">{tl.text}</p>
          </Link>
        ))}
      </Reveal>
    </div>
  );
}
