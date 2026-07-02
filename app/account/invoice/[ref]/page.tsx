import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";
import DownloadPdfButton from "@/components/account/DownloadPdfButton";

export const dynamic = "force-dynamic";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export default async function InvoicePage({ params }: { params: { ref: string } }) {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/login");
  const b = await prisma.booking.findFirst({ where: { reference: params.ref, customerId: customer.id } });
  if (!b) redirect("/account");

  const issued = new Date(b.createdAt);
  const invoiceNo = `INV-${b.reference}`;
  const paid = b.status === "confirmed";

  const Row = ({ label, value, strong }: { label: string; value: string; strong?: boolean }) => (
    <div className="flex justify-between py-2">
      <span className={`text-sm ${strong ? "text-ink font-medium" : "text-ink-muted font-light"}`}>{label}</span>
      <span className={`text-sm text-right ${strong ? "text-ink font-medium" : "text-ink"}`}>{value}</span>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <div className="flex items-center justify-between mb-8 print:hidden">
        <Link href="/account" className="inline-flex items-center gap-2 text-xs tracking-[0.1em] uppercase text-ink-muted hover:text-ink transition-colors">
          <ArrowLeft size={15} /> Back to my account
        </Link>
        <DownloadPdfButton
          label="Download invoice"
          data={{
            filename: `${invoiceNo}.pdf`,
            subtitle: "Tax Invoice",
            image: b.image || undefined,
            rows: [
              { label: "Invoice no.", value: invoiceNo },
              { label: "Date", value: issued.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) },
              { label: "Status", value: paid ? "Paid" : "Due" },
              { label: "Billed to", value: b.guestName },
              { label: "Email", value: b.guestEmail },
              ...(b.guestPhone ? [{ label: "Phone", value: b.guestPhone }] : []),
              { label: b.itemTitle, value: `INR ${b.total.toLocaleString("en-IN")}` },
              { label: "Taxes & fees", value: "Inclusive" },
              { label: "Total", value: `INR ${b.total.toLocaleString("en-IN")}` },
            ],
            footer: "Amount shown is inclusive of all applicable taxes. This invoice is issued by Voyages & Co. For billing queries, contact hello@voyagesco.com or +91 99199 10213. Thank you for travelling with us.",
          }}
        />
      </div>

      <div className="bg-panel-raised border border-line rounded-2xl shadow-card overflow-hidden">
        <div className="bg-ink text-page px-8 py-6 flex items-center justify-between">
          <div>
            <p className="font-serif text-2xl font-light">Voyages &amp; Co.</p>
            <p className="text-[10px] tracking-[0.2em] uppercase text-page/60">Tax Invoice</p>
          </div>
          <div className="relative w-24 h-10 opacity-90">
            <Image src="/logo-white.png" alt="Voyages & Co." fill sizes="96px" className="object-contain" />
          </div>
        </div>

        <div className="p-8">
          <div className="flex flex-wrap justify-between gap-6 mb-8">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-ink-faint mb-1">Billed to</p>
              <p className="text-sm text-ink">{b.guestName}</p>
              <p className="text-sm text-ink-muted font-light">{b.guestEmail}</p>
              {b.guestPhone && <p className="text-sm text-ink-muted font-light">{b.guestPhone}</p>}
            </div>
            <div className="text-right">
              <p className="text-[10px] tracking-[0.2em] uppercase text-ink-faint mb-1">Invoice</p>
              <p className="text-sm text-ink font-medium">{invoiceNo}</p>
              <p className="text-sm text-ink-muted font-light">{issued.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
              <span className={`inline-block mt-1 text-[10px] tracking-[0.14em] uppercase px-2 py-0.5 rounded-sm ${paid ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{paid ? "Paid" : "Due"}</span>
            </div>
          </div>

          {/* Line items */}
          <div className="border-t border-b border-line py-3">
            <div className="flex justify-between text-[10px] tracking-[0.16em] uppercase text-ink-faint pb-2">
              <span>Description</span><span>Amount</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-ink pr-4">
                {b.itemTitle}
                <span className="block text-xs text-ink-faint font-light">
                  {b.checkIn ? `${b.checkIn}${b.checkOut ? ` → ${b.checkOut}` : ""} · ` : ""}{b.guests} {b.guests === 1 ? "guest" : "guests"} · Ref {b.reference}
                </span>
              </span>
              <span className="text-sm text-ink whitespace-nowrap">{inr(b.total)}</span>
            </div>
          </div>

          <div className="mt-3">
            <Row label="Subtotal" value={inr(b.total)} />
            <Row label="Taxes & fees" value="Inclusive" />
            <div className="border-t border-line mt-1 pt-1">
              <Row label="Total" value={inr(b.total)} strong />
            </div>
          </div>

          <p className="text-xs text-ink-faint font-light leading-relaxed mt-8">
            Amount shown is inclusive of all applicable taxes. This invoice is issued by Voyages &amp; Co. For any billing queries, contact hello@voyagesco.com or +91 99199 10213. Thank you for travelling with us.
          </p>
        </div>
      </div>
    </div>
  );
}
