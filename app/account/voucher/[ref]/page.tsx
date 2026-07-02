import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";
import DownloadPdfButton from "@/components/account/DownloadPdfButton";

export const dynamic = "force-dynamic";

export default async function VoucherPage({ params }: { params: { ref: string } }) {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/login");
  const b = await prisma.booking.findFirst({ where: { reference: params.ref, customerId: customer.id } });
  if (!b) redirect("/account");

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between py-2.5 border-b border-line">
      <span className="text-xs tracking-[0.1em] uppercase text-ink-faint">{label}</span>
      <span className="text-sm text-ink text-right">{value}</span>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <div className="flex items-center justify-between mb-8 print:hidden">
        <Link href="/account" className="inline-flex items-center gap-2 text-xs tracking-[0.1em] uppercase text-ink-muted hover:text-ink transition-colors">
          <ArrowLeft size={15} /> Back to my account
        </Link>
        <DownloadPdfButton
          label="Download voucher"
          data={{
            filename: `voucher-${b.reference}.pdf`,
            subtitle: "Travel Voucher",
            image: b.image || undefined,
            headingLabel: "Booking reference",
            heading: b.reference,
            rows: [
              { label: "Journey", value: b.itemTitle },
              { label: "Guest", value: b.guestName },
              ...(b.checkIn ? [{ label: "Dates", value: `${b.checkIn}${b.checkOut ? ` to ${b.checkOut}` : ""}` }] : []),
              { label: "Guests", value: String(b.guests) },
              { label: "Status", value: b.status },
              { label: "Total", value: `INR ${b.total.toLocaleString("en-IN")}` },
            ],
            footer: "Please present this voucher on arrival. For changes or assistance, contact our concierge at hello@voyagesco.com or +91 99199 10213. This voucher is subject to our terms and the supplier's conditions.",
          }}
        />
      </div>

      <div className="bg-panel border border-line rounded-2xl shadow-card overflow-hidden">
        <div className="bg-ink text-page px-8 py-6 flex items-center justify-between">
          <div>
            <p className="font-serif text-2xl font-light">Voyages &amp; Co.</p>
            <p className="text-[10px] tracking-[0.2em] uppercase text-page/60">Travel Voucher</p>
          </div>
          <div className="relative w-24 h-10 opacity-90">
            <Image src="/logo-white.png" alt="Voyages & Co." fill sizes="96px" className="object-contain" />
          </div>
        </div>

        <div className="p-8">
          {b.image && (
            <div className="relative aspect-[16/7] rounded-lg overflow-hidden mb-6">
              <Image src={b.image} alt={b.itemTitle} fill sizes="100vw" className="object-cover" />
            </div>
          )}
          <div className="text-center mb-6">
            <p className="text-[10px] tracking-[0.2em] uppercase text-ink-faint mb-1">Booking reference</p>
            <p className="font-serif text-3xl font-light text-ink tracking-[0.15em]">{b.reference}</p>
          </div>

          <Row label="Journey" value={b.itemTitle} />
          <Row label="Guest" value={b.guestName} />
          {b.checkIn && <Row label="Dates" value={`${b.checkIn}${b.checkOut ? ` → ${b.checkOut}` : ""}`} />}
          <Row label="Guests" value={String(b.guests)} />
          <Row label="Status" value={b.status} />
          <Row label="Total" value={`₹${b.total.toLocaleString("en-IN")}`} />

          <p className="text-xs text-ink-faint font-light leading-relaxed mt-6">
            Please present this voucher on arrival. For changes or assistance, contact our concierge at hello@voyagesco.com or +91 99199 10213. This voucher is subject to our terms &amp; the supplier&apos;s conditions.
          </p>
        </div>
      </div>
    </div>
  );
}
