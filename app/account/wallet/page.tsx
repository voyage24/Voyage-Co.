import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Wallet, FileText, QrCode, Ticket, BadgeCheck, Plane } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";
import WalletOffline from "@/components/account/WalletOffline";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Travel Wallet — Voyages & Co.", robots: { index: false } };

const CAT_ICON: Record<string, typeof FileText> = { Passport: BadgeCheck, Visa: BadgeCheck, Insurance: FileText, Tickets: Ticket, Other: FileText };
const fmt = (s?: string | null) => (s && !isNaN(Date.parse(s)) ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(s)) : s || "");

// One place for everything a traveller reaches for at the airport: membership,
// documents (passport/visa/insurance/tickets), and each trip's passes — all
// saveable for offline use.
export default async function WalletPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/login?next=/account/wallet");

  const [docs, bookings] = await Promise.all([
    prisma.memberDocument.findMany({ where: { customerId: customer.id }, orderBy: { createdAt: "desc" } }),
    prisma.booking.findMany({ where: { customerId: customer.id, status: { not: "cancelled" } }, orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  // Passes worth carrying: confirmed / upcoming trips.
  const today = new Date().toISOString().slice(0, 10);
  const trips = bookings.filter(b => !b.checkIn || b.checkIn >= today || b.status === "confirmed").slice(0, 8);

  // Everything to pre-cache for offline.
  const offlineUrls = [
    ...docs.map(d => `/api/account/documents/${d.id}/file`),
    ...trips.flatMap(t => [`/account/pass/${t.reference}`, `/account/voucher/${t.reference}`]),
  ];

  const tier = customer.tier || "member";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
      <div className="flex items-center justify-between gap-3 mb-6">
        <Link href="/account" className="inline-flex items-center gap-2 text-xs tracking-[0.1em] uppercase text-ink-muted hover:text-ink transition-colors">
          <ArrowLeft size={15} /> Account
        </Link>
        <WalletOffline urls={offlineUrls} />
      </div>

      <div className="flex items-center gap-2 mb-1">
        <Wallet size={20} className="text-gold" />
        <h1 className="font-serif text-3xl font-light text-ink">Travel wallet</h1>
      </div>
      <p className="text-ink-muted font-light mb-8">Your documents and passes, in one place — and available offline.</p>

      {/* Membership card */}
      <div className="rounded-2xl overflow-hidden border border-line shadow-luxury mb-8">
        <div className="bg-gradient-to-br from-vc-950 to-[#2a1216] text-[#f4f0e9] p-6">
          <div className="flex items-center justify-between">
            <p className="text-[10px] tracking-[0.3em] uppercase text-gold">Voyages &amp; Co.</p>
            <span className="text-[10px] tracking-[0.2em] uppercase border border-gold/50 text-gold px-2.5 py-1 rounded-full capitalize">{tier}</span>
          </div>
          <p className="font-serif text-2xl font-light mt-6">{customer.name || customer.email}</p>
          <div className="flex items-center justify-between mt-4 text-xs text-white/70">
            <span>{(customer.points ?? 0).toLocaleString("en-IN")} points</span>
            <Link href="/membership" className="text-gold">Membership →</Link>
          </div>
        </div>
      </div>

      {/* Passes */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-ink mb-3">Boarding &amp; trip passes</h2>
        {trips.length === 0 ? (
          <p className="text-sm text-ink-faint">No trips yet.</p>
        ) : (
          <ul className="space-y-2">
            {trips.map(t => (
              <li key={t.id} className="flex items-center gap-3 border border-line rounded-xl p-3.5">
                {t.type === "flight" ? <Plane size={16} className="text-gold shrink-0" /> : <Ticket size={16} className="text-gold shrink-0" />}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-ink truncate">{t.itemTitle}</p>
                  <p className="text-[11px] text-ink-faint">{t.reference}{t.checkIn ? ` · ${fmt(t.checkIn)}` : ""} · {t.status}</p>
                </div>
                <Link href={`/account/pass/${t.reference}`} className="inline-flex items-center gap-1 text-xs text-gold hover:text-ink shrink-0"><QrCode size={13} /> Pass</Link>
                <Link href={`/account/voucher/${t.reference}`} className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-ink shrink-0"><FileText size={13} /> Voucher</Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Documents */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-ink">Documents</h2>
          <Link href="/account" className="text-xs text-gold link-underline">Manage in vault →</Link>
        </div>
        {docs.length === 0 ? (
          <p className="text-sm text-ink-faint">No documents saved. Add your passport, visa or insurance in the Document Vault on your account.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {docs.map(d => {
              const Icon = CAT_ICON[d.category] || FileText;
              return (
                <li key={d.id} className="flex items-center gap-3 border border-line rounded-xl p-3.5">
                  <Icon size={16} className="text-gold shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-ink truncate">{d.label}</p>
                    <p className="text-[11px] text-ink-faint">{d.category}{d.expiry ? ` · expires ${fmt(d.expiry)}` : ""}</p>
                  </div>
                  <a href={`/api/account/documents/${d.id}/file`} target="_blank" rel="noopener noreferrer" className="text-xs text-gold hover:text-ink shrink-0">Open</a>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <p className="text-[11px] text-ink-faint text-center mt-10">Tip: tap &ldquo;Make available offline&rdquo; before you fly so everything opens with no signal.</p>
    </div>
  );
}
