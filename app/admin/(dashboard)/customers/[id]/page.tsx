import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CustomerCrmPanel from "@/components/admin/CustomerCrmPanel";
import PurgeCustomer from "@/components/admin/PurgeCustomer";
import AdjustPoints from "@/components/admin/AdjustPoints";

export const dynamic = "force-dynamic";

type Event = { kind: string; date: Date; title: string; detail?: string; href?: string; tone: string };

// Static class map — Tailwind can't see interpolated class names.
const DOT: Record<string, string> = { emerald: "bg-emerald-400", blue: "bg-blue-400", violet: "bg-violet-400", gray: "bg-gray-400" };
const fmt = (d: Date) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(d);
const money = (n: number, c = "INR") => new Intl.NumberFormat("en-IN", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(n);

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const customer = await prisma.customer.findUnique({ where: { id: params.id } });
  if (!customer) notFound();
  const email = customer.email;
  const ci = { equals: email, mode: "insensitive" as const };

  const [bookings, enquiries, quotes, inbound, sent, notes, followups] = await Promise.all([
    prisma.booking.findMany({ where: { OR: [{ customerId: customer.id }, { guestEmail: ci }] }, orderBy: { createdAt: "desc" } }),
    prisma.enquiry.findMany({ where: { email: ci }, orderBy: { createdAt: "desc" } }),
    prisma.quote.findMany({ where: { customerEmail: ci }, orderBy: { createdAt: "desc" } }),
    prisma.inboundEmail.findMany({ where: { fromEmail: ci, deleted: false }, orderBy: { createdAt: "desc" }, take: 40 }),
    prisma.sentEmail.findMany({ where: { toEmail: ci }, orderBy: { createdAt: "desc" }, take: 40 }),
    prisma.customerNote.findMany({ where: { email: ci }, orderBy: { createdAt: "desc" } }),
    prisma.followUp.findMany({ where: { email: ci }, orderBy: [{ done: "asc" }, { dueAt: "asc" }] }),
  ]);

  const events: Event[] = [
    // Lead with the figure the guest was quoted when they weren't browsing in INR.
    ...bookings.map(b => ({ kind: "Booking", date: b.createdAt, title: b.itemTitle, detail: `${b.reference} · ${b.quoteCurrency && b.quoteCurrency !== "INR" && b.quoteTotal ? `${money(b.quoteTotal, b.quoteCurrency)} · ${money(b.total, b.currency)}` : money(b.total, b.currency)} · ${b.status}`, href: `/admin/bookings`, tone: "emerald" })),
    ...enquiries.map(e => ({ kind: "Enquiry", date: e.createdAt, title: e.subject || e.itemTitle || e.type, detail: `${e.stage}${e.message ? " · " + e.message.slice(0, 80) : ""}`, href: `/admin/enquiries`, tone: "blue" })),
    ...quotes.map(q => ({ kind: "Quote", date: q.createdAt, title: q.title, detail: `${money(q.total, q.currency)} · ${q.status}`, href: `/admin/quotes`, tone: "violet" })),
    ...inbound.map(m => ({ kind: "Email in", date: m.createdAt, title: m.subject || "(no subject)", detail: `from ${m.fromEmail}`, href: `/admin/mail`, tone: "gray" })),
    ...sent.map(m => ({ kind: "Email sent", date: m.createdAt, title: m.subject, detail: `to ${m.toEmail}`, href: `/admin/mail`, tone: "gray" })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const totalValue = bookings.filter(b => b.status !== "cancelled").reduce((s, b) => s + b.total, 0);

  return (
    <div className="max-w-4xl">
      <Link href="/admin/customers" className="text-xs text-gray-500 hover:text-gray-800">← Customers</Link>

      {/* Header */}
      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{customer.name || email}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
            <a href={`mailto:${email}`} className="text-blue-600 hover:underline">{email}</a>
            {customer.phone && <span>· {customer.phone}</span>}
            <span className="capitalize">· {customer.tier}</span>
            <span>· member since {fmt(customer.createdAt)}</span>
          </div>
        </div>
        <a href={`/admin/mail/compose?to=${encodeURIComponent(email)}`} className="text-xs px-3 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-700">Email this client</a>
      </div>

      {/* Stat strip */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Bookings", value: String(bookings.length) },
          { label: "Lifetime value", value: money(totalValue) },
          { label: "Enquiries", value: String(enquiries.length) },
          { label: "Points", value: String(customer.points) },
        ].map(s => (
          <div key={s.label} className="rounded-lg border border-gray-200 bg-white p-3">
            <p className="text-lg font-semibold text-gray-900">{s.value}</p>
            <p className="text-[11px] uppercase tracking-wide text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      <AdjustPoints customerId={customer.id} points={customer.points} tier={customer.tier} />

      {/* Notes + follow-ups (interactive) */}
      <CustomerCrmPanel
        email={email}
        initialNotes={notes.map(n => ({ id: n.id, body: n.body, author: n.author, createdAt: n.createdAt.toISOString() }))}
        initialFollowups={followups.map(f => ({ id: f.id, title: f.title, dueAt: f.dueAt.toISOString(), done: f.done }))}
      />

      {/* Timeline */}
      <h2 className="mt-8 mb-3 text-sm font-semibold text-gray-700">Activity timeline</h2>
      {events.length === 0 ? (
        <p className="text-sm text-gray-400">No bookings, enquiries or emails yet.</p>
      ) : (
        <ol className="relative border-l border-gray-200 ml-2">
          {events.map((e, i) => (
            <li key={i} className="ml-4 pb-5">
              <span className={`absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full ${DOT[e.tone] || "bg-gray-400"} ring-4 ring-white`} />
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-[11px] uppercase tracking-wide text-gray-400">{e.kind}</span>
                <span className="text-xs text-gray-400">{fmt(e.date)}</span>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {e.href ? <Link href={e.href} className="hover:underline">{e.title}</Link> : e.title}
              </p>
              {e.detail && <p className="text-xs text-gray-500">{e.detail}</p>}
            </li>
          ))}
        </ol>
      )}

      <PurgeCustomer
        customerId={customer.id}
        email={email}
        counts={{ bookings: bookings.length, enquiries: enquiries.length, quotes: quotes.length, notes: notes.length, followups: followups.length }}
      />
    </div>
  );
}
