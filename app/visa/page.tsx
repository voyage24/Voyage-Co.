import type { Metadata } from "next";
import { FileCheck, Clock, ShieldCheck, HelpCircle } from "lucide-react";
import RequestForm from "@/components/tools/RequestForm";
import Reveal from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Visa Services — Voyages & Co.",
  description: "Visa guidance and end-to-end assistance for your journey — documentation, appointments and applications, handled.",
};

const STEPS = [
  { icon: HelpCircle, title: "Tell us your trip", text: "Share your destination, passport and travel dates and we'll confirm exactly what's required." },
  { icon: FileCheck, title: "Document checklist", text: "We prepare a tailored checklist and review your paperwork before submission." },
  { icon: Clock, title: "Appointments & filing", text: "We book biometrics/appointments where needed and guide the application through." },
  { icon: ShieldCheck, title: "Track to approval", text: "We keep you updated at every stage, right through to your visa in hand." },
];

export default function VisaPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <div className="text-center mb-12">
        <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-3">Travel Services</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-4">Visa assistance</h1>
        <p className="text-ink-muted font-light max-w-xl mx-auto">Entry requirements can be daunting. Our team demystifies the paperwork and supports you from checklist to approval — for tourist, business and transit visas worldwide.</p>
      </div>

      <Reveal soft className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.title} className="bg-panel border border-line rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3"><span className="text-[11px] text-gold">0{i + 1}</span><s.icon size={18} className="text-gold" /></div>
            <h3 className="font-serif text-lg font-light text-ink mb-1.5">{s.title}</h3>
            <p className="text-sm text-ink-muted font-light leading-relaxed">{s.text}</p>
          </div>
        ))}
      </Reveal>

      <p className="text-xs text-ink-faint font-light leading-relaxed mb-10 text-center max-w-2xl mx-auto">
        Requirements vary by nationality and change often. This service provides guidance and application support; issuance is always at the discretion of the relevant embassy or consulate.
      </p>

      <RequestForm
        endpoint="/api/visa-request"
        title="Request visa assistance"
        submitLabel="Request assistance"
        successText="Our visa team will review your trip and reply with the exact requirements and next steps."
        fields={[
          { key: "destination", label: "Destination country", required: true, placeholder: "e.g. Japan" },
          { key: "nationality", label: "Passport / nationality", placeholder: "e.g. Indian" },
          { key: "visaType", label: "Visa type", type: "select", options: ["Tourist", "Business", "Transit", "Not sure"] },
          { key: "travelDate", label: "Approx. travel date", type: "date" },
          { key: "details", label: "Anything else", type: "textarea", placeholder: "Number of travellers, prior visas, timelines…" },
        ]}
      />
    </div>
  );
}
