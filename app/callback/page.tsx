import type { Metadata } from "next";
import CallbackForm from "@/components/contact/CallbackForm";

export const metadata: Metadata = {
  title: "Request a Callback — Voyages & Co.",
  description: "Leave your number and a travel advisor will call you at a time that suits you.",
};

export default function CallbackPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <div className="text-center mb-8">
        <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-3">Speak to an advisor</p>
        <h1 className="font-serif text-3xl sm:text-4xl font-light text-ink mb-3">Request a callback</h1>
        <p className="text-ink-muted font-light max-w-lg mx-auto">
          Tell us when suits you and one of our travel advisors will call to help plan your journey — no obligation.
        </p>
      </div>
      <CallbackForm />
    </div>
  );
}
