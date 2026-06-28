import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";

export const dynamic = "force-dynamic";

export default async function JourneyJournalPage({ params }: { params: { ref: string } }) {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/login");

  const booking = await prisma.booking.findFirst({
    where: { reference: params.ref, customerId: customer.id },
  });
  if (!booking) redirect("/account");

  const firstName = customer.name?.split(" ")[0] ?? "traveller";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <Link href="/account" className="inline-flex items-center gap-2 text-xs tracking-[0.1em] uppercase text-ink-muted hover:text-ink mb-8 transition-colors">
        <ArrowLeft size={15} /> Back to my account
      </Link>

      {booking.image && (
        <div className="relative rounded-2xl overflow-hidden aspect-[16/9] mb-8">
          <Image src={booking.image} alt={booking.itemTitle} fill sizes="100vw" className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-vc-950/70 via-vc-950/10 to-transparent" />
          <div className="absolute bottom-0 left-0 p-7">
            <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-2">Your Journey</p>
            <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#f4f0e9]">{booking.itemTitle}</h1>
          </div>
        </div>
      )}

      <div className="bg-panel border border-line rounded-2xl shadow-card p-8 text-center">
        <p className="font-serif text-2xl font-light text-ink mb-3">A keepsake of your travels, {firstName}.</p>
        <p className="text-ink-muted font-light leading-relaxed max-w-lg mx-auto mb-6">
          Every journey leaves something behind — a view, a meal, a moment of stillness. This page holds the
          details of yours, to revisit whenever you wish.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-xl mx-auto">
          <div className="bg-panel-soft border border-line rounded-xl p-4">
            <p className="text-[10px] tracking-[0.14em] uppercase text-ink-faint mb-1">Reference</p>
            <p className="text-sm font-medium text-ink">{booking.reference}</p>
          </div>
          <div className="bg-panel-soft border border-line rounded-xl p-4">
            <p className="text-[10px] tracking-[0.14em] uppercase text-ink-faint mb-1">Dates</p>
            <p className="text-sm font-medium text-ink">{booking.checkIn ? `${booking.checkIn}${booking.checkOut ? ` → ${booking.checkOut}` : ""}` : "—"}</p>
          </div>
          <div className="bg-panel-soft border border-line rounded-xl p-4">
            <p className="text-[10px] tracking-[0.14em] uppercase text-ink-faint mb-1">Travellers</p>
            <p className="text-sm font-medium text-ink">{booking.guests}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link href={`/${booking.type === "package" ? "packages" : booking.type === "experience" ? "experiences" : booking.type === "cruise" ? "cruises" : "hotels"}/${booking.itemId}`}
            className="px-6 py-3 border border-line-strong text-ink text-xs tracking-[0.14em] uppercase rounded-sm hover:bg-ink hover:text-page transition-all">
            Revisit this journey
          </Link>
          <Link href="/plan" className="px-6 py-3 bg-ink text-page text-xs tracking-[0.14em] uppercase rounded-sm hover:bg-ink/90 transition-colors">
            Plan your next
          </Link>
        </div>
      </div>
    </div>
  );
}
