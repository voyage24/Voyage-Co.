import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";
import GuestTrips from "@/components/pages/GuestTrips";
import Price from "@/components/ui/Price";
import { getPageContent } from "@/lib/page-content";

export const dynamic = "force-dynamic";

const STATUS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-gray-100 text-gray-500 border-gray-200",
};

function fmtDate(d?: string | null): string {
  if (!d) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d);
  if (!m) return d;
  return new Date(+m[1], +m[2] - 1, +m[3]).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default async function TripsPage() {
  const customer = await getCurrentCustomer();
  // Signed-in travellers see their real account bookings; guests (or anyone not
  // signed in on this device) fall back to trips saved locally in the browser.
  if (!customer) return <GuestTrips />;

  const bookings = await prisma.booking.findMany({ where: { customerId: customer.id }, orderBy: { createdAt: "desc" } });
  if (bookings.length === 0) return <GuestTrips />;
  const c = await getPageContent();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
      <div className="text-center mb-12">
        <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-3">{c("trips.eyebrow")}</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-3">{c("trips.title")}</h1>
        <p className="text-ink-muted font-light">{c("trips.intro")}</p>
      </div>

      <div className="space-y-4">
        {bookings.map(b => {
          const isFlight = b.type === "flight";
          return (
            <div key={b.id} className="bg-panel border border-line rounded-2xl shadow-card overflow-hidden flex flex-col sm:flex-row">
              {b.image && (
                <div className="relative sm:w-52 shrink-0 aspect-[16/10] sm:aspect-auto">
                  <Image src={b.image} alt={b.itemTitle} fill sizes="(max-width: 640px) 100vw, 208px" className="object-cover" />
                </div>
              )}
              <div className="flex-1 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] tracking-[0.2em] uppercase text-gold">{b.type}</span>
                    <span className="text-[10px] tracking-[0.1em] uppercase text-ink-faint">· Ref {b.reference}</span>
                    <span className={`text-[9px] tracking-[0.12em] uppercase px-2 py-0.5 rounded-full border ${STATUS[b.status] ?? STATUS.pending}`}>{b.status}</span>
                  </div>
                  <h3 className="font-serif text-xl font-light text-ink leading-snug truncate">{b.itemTitle}</h3>
                  {b.checkIn && <p className="text-sm text-ink-muted font-light">{fmtDate(b.checkIn)}{b.checkOut ? ` → ${fmtDate(b.checkOut)}` : ""}</p>}
                  <p className="text-xs text-ink-faint font-light mt-1">{b.guestName}{isFlight && b.seat ? ` · Seat ${b.seat}` : ""}</p>
                </div>
                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 shrink-0">
                  <p className="font-serif text-2xl font-light text-ink"><Price amount={b.total} /></p>
                  <Link href={`/account/voucher/${b.reference}`} className="inline-flex items-center gap-1.5 text-xs tracking-[0.12em] uppercase text-ink-muted hover:text-ink transition-colors">
                    {isFlight ? "Boarding pass" : "Voucher"} <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-10">
        <Link href="/account" className="text-xs tracking-[0.14em] uppercase text-ink-muted hover:text-ink transition-colors">Manage in my account →</Link>
      </div>
    </div>
  );
}
