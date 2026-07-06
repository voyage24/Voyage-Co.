import Link from "next/link";
import OfflineTrips from "@/components/account/OfflineTrips";

export const metadata = { title: "Offline — Voyages & Co." };

export default function OfflinePage() {
  return (
    <div className="max-w-lg mx-auto px-6 pt-40 pb-20 text-center">
      <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-3">Offline</p>
      <h1 className="font-serif text-3xl font-light text-ink mb-3">You&apos;re offline</h1>
      <p className="text-ink-muted font-light mb-6">It looks like you&apos;ve lost connection. Your trips and saved itinerary are still available on this device.</p>
      <Link href="/itinerary" className="inline-block px-6 py-3 bg-ink text-page text-xs tracking-[0.16em] uppercase rounded-sm hover:bg-ink/90 transition-colors">View my itinerary</Link>
      <OfflineTrips />
    </div>
  );
}
