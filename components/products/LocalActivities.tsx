import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";

export type NearbyActivity = {
  id: string;
  title: string;
  location: string;
  image: string;
  category: string;
  duration: string;
};

// Surfaces local experiences & activities near a stay/destination.
export default function LocalActivities({ items, place }: { items: NearbyActivity[]; place?: string }) {
  if (!items.length) return null;
  return (
    <div className="border-t border-line pt-8 mt-8">
      <div className="flex items-end justify-between gap-3 mb-4">
        <h2 className="font-serif text-2xl font-light text-ink">Things to do{place ? ` in ${place}` : " nearby"}</h2>
        <Link href="/experiences" className="text-xs tracking-[0.1em] uppercase text-gold hover:underline shrink-0">All experiences →</Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {items.map(a => (
          <Link key={a.id} href={`/experiences/${a.id}`} className="group block bg-panel border border-line rounded-xl overflow-hidden hover:border-gold/40 hover:-translate-y-1 transition-all">
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image src={a.image} alt={a.title} fill sizes="(max-width:640px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
              <span className="absolute top-2 left-2 text-[9px] tracking-[0.14em] uppercase bg-vc-950/70 text-white px-2 py-0.5 rounded-sm">{a.category}</span>
            </div>
            <div className="p-4">
              <p className="font-serif text-base font-light text-ink leading-snug line-clamp-2">{a.title}</p>
              <p className="text-xs text-ink-faint font-light mt-1.5 flex items-center gap-1"><MapPin size={11} className="text-gold" /> {a.location} · {a.duration}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
