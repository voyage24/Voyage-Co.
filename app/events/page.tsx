import type { Metadata } from "next";
import Image from "next/image";
import { getCollection } from "@/lib/collections";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Events — Voyages & Co.",
  description: "Private previews, salons and curated journeys with our travel specialists.",
};

export default async function EventsPage() {
  const events = await getCollection("events");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
      <div className="text-center mb-12">
        <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-3">What&apos;s On</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-4">Events</h1>
        <p className="text-ink-muted font-light max-w-xl mx-auto">Private previews, salons and curated journeys with our specialists — by invitation and open registration alike.</p>
      </div>

      {events.length === 0 ? (
        <div className="text-center bg-panel-soft border border-line rounded-2xl p-16">
          <p className="text-ink-muted font-light">No upcoming events just now — please check back soon.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {events.map(e => (
            <div key={e.id} className="bg-panel border border-line rounded-2xl shadow-card overflow-hidden flex flex-col sm:flex-row">
              {e.data.image && (
                <div className="relative sm:w-64 shrink-0 aspect-[16/10] sm:aspect-auto">
                  <Image src={e.data.image} alt={e.data.title ?? ""} fill sizes="256px" className="object-cover" />
                </div>
              )}
              <div className="p-6 flex-1">
                {(e.data.date || e.data.location) && (
                  <p className="text-[11px] tracking-[0.16em] uppercase text-gold mb-1.5">{e.data.date}{e.data.date && e.data.location ? " · " : ""}{e.data.location}</p>
                )}
                <h2 className="font-serif text-2xl font-light text-ink mb-2">{e.data.title}</h2>
                {e.data.description && <p className="text-sm text-ink-muted font-light leading-relaxed mb-4">{e.data.description}</p>}
                {e.data.rsvpUrl && (
                  <a href={e.data.rsvpUrl} target="_blank" rel="noopener noreferrer" className="inline-block px-6 py-2.5 bg-ink text-page text-xs tracking-[0.16em] uppercase rounded-sm hover:bg-ink/90 transition-colors">RSVP</a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
