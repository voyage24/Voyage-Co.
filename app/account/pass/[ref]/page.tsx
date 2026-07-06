import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";
import { fmtDate } from "@/lib/boarding-pass";
import AddToWallet from "@/components/account/AddToWallet";

export const dynamic = "force-dynamic";

// A mobile "wallet pass" for a booking — a QR of the booking reference plus the
// key details, styled to save to the phone (screenshot / add to home) and cached
// for offline use at a check-in desk. Native Apple/Google Wallet is offered via
// AddToWallet when signing credentials are configured.
export default async function PassPage({ params }: { params: { ref: string } }) {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/login");
  const b = await prisma.booking.findFirst({ where: { reference: params.ref, customerId: customer.id } });
  if (!b) redirect("/account");

  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://voyagesco.com";
  const qr = await QRCode.toDataURL(`${base}/account/voucher/${b.reference}`, {
    margin: 1, width: 320, color: { dark: "#1c0a0d", light: "#ffffff" },
  });

  return (
    <div className="max-w-md mx-auto px-4 pt-24 pb-16">
      <Link href="/account" className="inline-flex items-center gap-2 text-xs tracking-[0.1em] uppercase text-ink-muted hover:text-ink transition-colors mb-6">
        <ArrowLeft size={15} /> Back to my account
      </Link>

      <div className="rounded-3xl overflow-hidden border border-line shadow-luxury bg-panel">
        <div className="bg-vc-950 text-[#f4f0e9] px-6 py-5">
          <p className="text-[10px] tracking-[0.3em] uppercase text-gold">Voyages &amp; Co.</p>
          <p className="font-serif text-xl font-light mt-1 leading-tight">{b.itemTitle}</p>
          <p className="text-xs text-white/60 mt-1 capitalize">{b.type} · {b.status}</p>
        </div>

        <div className="flex justify-center py-7 bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt={`QR code for booking ${b.reference}`} width={200} height={200} className="w-48 h-48" />
        </div>

        <div className="px-6 py-5 space-y-3">
          <Field label="Reference" value={b.reference} mono />
          <Field label="Guest" value={b.guestName} />
          {b.checkIn && <Field label={b.type === "flight" ? "Departs" : "Check-in"} value={fmtDate(b.checkIn)} />}
          {b.checkOut && <Field label="Check-out" value={fmtDate(b.checkOut)} />}
          {b.seat && <Field label="Seat" value={b.seat} />}
          <Field label="Guests" value={String(b.guests)} />
        </div>

        <div className="px-6 pb-6">
          <AddToWallet reference={b.reference} />
        </div>
      </div>

      <p className="text-[11px] text-ink-faint text-center mt-4">Show this QR at check-in. Saved on this device for offline use.</p>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[11px] tracking-[0.12em] uppercase text-ink-faint">{label}</span>
      <span className={`text-sm text-ink text-right ${mono ? "font-mono tracking-wide" : ""}`}>{value}</span>
    </div>
  );
}
