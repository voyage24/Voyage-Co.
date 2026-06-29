import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

const CARDS = [
  { key: "hotel", label: "Hotels", href: "/admin/hotels" },
  { key: "package", label: "Packages", href: "/admin/packages" },
  { key: "experience", label: "Experiences", href: "/admin/experiences" },
  { key: "cruise", label: "Cruises", href: "/admin/cruises" },
  { key: "flight", label: "Flights", href: "/admin/flights" },
  { key: "train", label: "Trains", href: "/admin/trains" },
  { key: "blogPost", label: "Blog Posts", href: "/admin/blog" },
  { key: "customer", label: "Customers", href: "/admin/customers" },
] as const;

const QUICK = [
  { label: "New hotel", href: "/admin/hotels/new" },
  { label: "New package", href: "/admin/packages/new" },
  { label: "New quote", href: "/admin/quotes/new" },
  { label: "Send push", href: "/admin/notifications" },
];

const fmtDate = (d: Date | string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

export default async function AdminDashboardPage() {
  const [hotel, flight, train, experience, pkg, cruise, blogPost, newsletter, newEnquiries, pendingBookings, customer, pendingReviews, recentBookings, recentEnquiries] = await Promise.all([
    prisma.hotel.count(), prisma.flight.count(), prisma.train.count(), prisma.experience.count(),
    prisma.package.count(), prisma.cruise.count(), prisma.blogPost.count(), prisma.newsletterSubscriber.count(),
    prisma.enquiry.count({ where: { status: "new" } }),
    prisma.booking.count({ where: { status: "pending" } }),
    prisma.customer.count(),
    prisma.review.count({ where: { status: "pending" } }),
    prisma.booking.findMany({ orderBy: { createdAt: "desc" }, take: 6, select: { id: true, reference: true, guestName: true, itemTitle: true, status: true, total: true, createdAt: true } }),
    prisma.enquiry.findMany({ orderBy: { createdAt: "desc" }, take: 6, select: { id: true, name: true, type: true, subject: true, stage: true, createdAt: true } }),
  ]);

  const counts: Record<string, number> = { hotel, flight, train, experience, package: pkg, cruise, blogPost, customer };

  const Alert = ({ href, n, label }: { href: string; n: number; label: string }) => (
    <Link href={href} className={`block rounded-xl p-5 border transition-colors ${n > 0 ? "bg-amber-50 border-amber-300 hover:border-amber-400" : "bg-white border-gray-200 hover:border-gray-400"}`}>
      <p className="text-3xl font-semibold text-gray-900">{n}</p>
      <p className="text-sm text-gray-600 mt-1">{label}</p>
    </Link>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">A live snapshot of your atelier.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK.map(q => (
            <Link key={q.href} href={q.href} className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">
              <Plus size={14} /> {q.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Alert href="/admin/bookings" n={pendingBookings} label={`Pending ${pendingBookings === 1 ? "booking" : "bookings"}`} />
        <Alert href="/admin/enquiries" n={newEnquiries} label={`New ${newEnquiries === 1 ? "enquiry" : "enquiries"}`} />
        <Alert href="/admin/reviews" n={pendingReviews} label={`${pendingReviews === 1 ? "Review" : "Reviews"} to moderate`} />
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-900">Latest bookings</p>
            <Link href="/admin/bookings" className="text-xs text-gray-500 hover:text-gray-900 inline-flex items-center gap-1">All <ArrowRight size={12} /></Link>
          </div>
          {recentBookings.length === 0 ? <p className="text-sm text-gray-400">No bookings yet.</p> : (
            <ul className="divide-y divide-gray-100">
              {recentBookings.map(b => (
                <li key={b.id} className="py-2.5 flex items-center gap-3">
                  <span className={`text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded shrink-0 ${b.status === "confirmed" ? "bg-emerald-50 text-emerald-700" : b.status === "cancelled" ? "bg-gray-100 text-gray-500" : "bg-amber-50 text-amber-700"}`}>{b.status}</span>
                  <span className="min-w-0 flex-1"><span className="block text-sm text-gray-900 truncate">{b.itemTitle}</span><span className="block text-xs text-gray-400 truncate">{b.guestName} · {b.reference}</span></span>
                  <span className="text-xs text-gray-400 shrink-0">{fmtDate(b.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-900">Latest enquiries</p>
            <Link href="/admin/enquiries" className="text-xs text-gray-500 hover:text-gray-900 inline-flex items-center gap-1">All <ArrowRight size={12} /></Link>
          </div>
          {recentEnquiries.length === 0 ? <p className="text-sm text-gray-400">No enquiries yet.</p> : (
            <ul className="divide-y divide-gray-100">
              {recentEnquiries.map(e => (
                <li key={e.id} className="py-2.5 flex items-center gap-3">
                  <span className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 shrink-0">{e.type}</span>
                  <span className="min-w-0 flex-1"><span className="block text-sm text-gray-900 truncate">{e.name}</span><span className="block text-xs text-gray-400 truncate">{e.subject ?? e.stage}</span></span>
                  <span className="text-xs text-gray-400 shrink-0">{fmtDate(e.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Catalogue counts */}
      <div>
        <p className="text-xs font-semibold tracking-[0.14em] uppercase text-gray-400 mb-3">Catalogue</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {CARDS.map(c => (
            <Link key={c.key} href={c.href} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-400 transition-colors">
              <p className="text-3xl font-semibold text-gray-900">{counts[c.key]}</p>
              <p className="text-sm text-gray-500 mt-1">{c.label}</p>
            </Link>
          ))}
          <Link href="/admin/newsletter" className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-400 transition-colors">
            <p className="text-3xl font-semibold text-gray-900">{newsletter}</p>
            <p className="text-sm text-gray-500 mt-1">Subscribers</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
