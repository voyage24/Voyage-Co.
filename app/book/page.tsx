import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import BookingForm, { type BookingItem } from "@/components/booking/BookingForm";
import T from "@/components/ui/T";

export const dynamic = "force-dynamic";

async function resolveItem(type?: string, id?: string): Promise<BookingItem | null> {
  if (!type || !id) return null;

  if (type === "hotel") {
    const h = await prisma.hotel.findUnique({ where: { id } });
    if (!h) return null;
    return { type, id, title: h.name, subtitle: h.location, image: h.image,
      price: h.pricePerNight, priceLabel: "booking.perNight", needsDates: true };
  }
  if (type === "flight") {
    const f = await prisma.flight.findUnique({ where: { id } });
    if (!f) return null;
    return { type, id,
      title: `${f.airline} · ${f.flightNumber}`,
      subtitle: `${f.originCity} (${f.origin}) → ${f.destinationCity} (${f.destination}) · ${f.departure}–${f.arrival}`,
      price: f.price,
      priceLabel: "booking.perGuest" };
  }
  if (type === "package") {
    const p = await prisma.package.findUnique({ where: { id } });
    if (!p) return null;
    return { type, id, title: p.title, subtitle: p.destinations.join(" · "), image: p.image,
      price: p.pricePerPerson, priceLabel: "booking.perPerson" };
  }
  if (type === "experience") {
    const e = await prisma.experience.findUnique({ where: { id } });
    if (!e) return null;
    return { type, id, title: e.title, subtitle: e.location, image: e.image,
      price: e.price, priceLabel: "booking.perPerson" };
  }
  if (type === "train") {
    const t = await prisma.train.findUnique({ where: { id } });
    if (!t) return null;
    const classes = t.classes as { type: string; price: number; available: number }[];
    const low = [...classes].sort((a, b) => a.price - b.price)[0];
    return { type, id,
      title: t.name,
      subtitle: `${t.originCity} (${t.origin}) → ${t.destinationCity} (${t.destination})`,
      price: low ? low.price : 0,
      priceLabel: "booking.perGuest" };
  }
  if (type === "cruise") {
    const c = await prisma.cruise.findUnique({ where: { id } });
    if (!c) return null;
    return { type, id, title: `${c.name} · ${c.ship}`, subtitle: `${c.departurePort} · ${c.ports.join(" · ")}`, image: c.image,
      price: c.pricePerPerson, priceLabel: "booking.perPerson" };
  }
  return null;
}

export default async function BookPage({
  searchParams,
}: {
  searchParams: { type?: string; id?: string };
}) {
  const item = await resolveItem(searchParams.type, searchParams.id);

  if (!item) {
    return (
      <div className="max-w-2xl mx-auto px-6 pt-40 pb-32 text-center">
        <h1 className="font-serif text-4xl font-light text-ink mb-4"><T k="booking.nothingToReserve" /></h1>
        <p className="text-ink-muted font-light mb-8"><T k="booking.itemNotFound" /></p>
        <Link href="/" className="inline-block px-7 py-3.5 bg-ink text-page text-xs tracking-[0.16em] uppercase rounded-sm hover:bg-ink/90 transition-colors">
          <T k="booking.returnHome" />
        </Link>
      </div>
    );
  }

  const backHref =
    item.type === "hotel" ? "/hotels" :
    item.type === "flight" ? "/flights" :
    item.type === "package" ? "/packages" :
    item.type === "experience" ? "/experiences" :
    item.type === "cruise" ? "/cruises" : "/trains";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <Link href={backHref} className="inline-flex items-center gap-2 text-xs tracking-[0.1em] uppercase text-ink-muted hover:text-ink mb-8 transition-colors">
        <ArrowLeft size={15} /> <T k="booking.back" />
      </Link>
      <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-3"><T k="booking.reservation" /></p>
      <h1 className="font-serif text-4xl sm:text-5xl font-light text-ink mb-10"><T k="booking.completeBooking" /></h1>
      <BookingForm item={item} />
    </div>
  );
}
