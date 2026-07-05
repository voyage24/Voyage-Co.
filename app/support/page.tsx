import Link from "next/link";
import type { Metadata } from "next";
import { Phone, MessageCircle, PhoneCall, Mail } from "lucide-react";
import { getSiteSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Support — Voyages & Co.",
  description: "Reach our concierge — call, message on WhatsApp, request a callback, or email us.",
};

export default async function SupportPage() {
  const settings = await getSiteSettings();
  const phone = settings["contact.phone"] || "+91 99199 10213";
  const whatsapp = settings["contact.whatsapp"] || "919919910213";
  const email = settings["contact.email"] || "hello@voyagesco.com";
  const telHref = `tel:${phone.replace(/[^\d+]/g, "")}`;

  const action = "inline-flex items-center justify-center gap-2 px-5 py-3 text-xs tracking-[0.14em] uppercase rounded-sm transition-all";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <div className="text-center mb-10">
        <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-3">Support</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-4">We&apos;re here to help</h1>
        <p className="text-ink-muted font-light max-w-xl mx-auto">Speak to our concierge directly — call us, message on WhatsApp, request a callback, or send an email. A real advisor will respond.</p>
      </div>

      <div className="bg-panel border border-line rounded-2xl p-8 text-center">
        <p className="text-[11px] tracking-[0.16em] uppercase text-ink-faint mb-2">Call the concierge</p>
        <a href={telHref} className="font-serif text-3xl sm:text-4xl font-light text-ink hover:text-gold transition-colors">{phone}</a>

        <div className="flex flex-wrap gap-3 justify-center mt-7">
          <a href={telHref} className={`${action} bg-ink text-page hover:bg-ink/90`}>
            <Phone size={15} /> Call now
          </a>
          <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className={`${action} border border-line-strong text-ink hover:bg-ink hover:text-page`}>
            <MessageCircle size={15} /> WhatsApp
          </a>
          <Link href="/callback" className={`${action} border border-line-strong text-ink hover:bg-ink hover:text-page`}>
            <PhoneCall size={15} /> Request a callback
          </Link>
        </div>

        <div className="mt-9 pt-7 border-t border-line">
          <p className="text-[11px] tracking-[0.16em] uppercase text-ink-faint mb-2">Or email us</p>
          <a href={`mailto:${email}`} className="inline-flex items-center gap-2 text-ink hover:text-gold transition-colors font-light">
            <Mail size={15} className="text-gold" /> {email}
          </a>
        </div>
      </div>

      <p className="text-center text-sm text-ink-muted font-light mt-8">
        Looking for answers to common questions? See our <Link href="/faq" className="text-gold link-underline">FAQ</Link>.
      </p>
    </div>
  );
}
