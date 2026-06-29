import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Plus, ArrowRight, CalendarCheck, Inbox, Star, BedDouble, Package, Sparkles,
  Ship, Plane, TrainFront, Newspaper, Users, Mail,
} from "lucide-react";

export const dynamic = "force-dynamic";

const CARDS = [
  { key: "hotel", label: "Hotels", href: "/admin/hotels", icon: BedDouble, tint: "bg-emerald-50 text-emerald-600" },
  { key: "package", label: "Packages", href: "/admin/packages", icon: Package, tint: "bg-indigo-50 text-indigo-600" },
  { key: "experience", label: "Experiences", href: "/admin/experiences", icon: Sparkles, tint: "bg-amber-50 text-amber-600" },
  { key: "cruise", label: "Cruises", href: "/admin/cruises", icon: Ship, tint: "bg-sky-50 text-sky-600" },
  { key: "flight", label: "Flights", href: "/admin/flights", icon: Plane, tint: "bg-violet-50 text-violet-600" },
  { key: "train", label: "Trains", href: "/admin/trains", icon: TrainFront, tint: "bg-teal-50 text-teal-600" },
  { key: "blogPost", label: "Blog Posts", href: "/admin/blog", icon: Newspaper, tint: "bg-rose-50 text-rose-600" },
  { key: "customer", label: "Customers", href: "/admin/customers", icon: Users, tint: "bg-slate-100 text-slate-600" },
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
    prisma.booking.findMany({ orderBy: { createdAt: "desc" }, take: 6, select: { id: true, reference: true, guestName: true, itemTitle: true, status: true, createdAt: true } }),
    prisma.enquiry.findMany({ orderBy: { createdAt: "desc" }, take: 6, select: { id: true, name: true, type: true, subject: true, stage: true, createdAt: true } }),
  ]);

  const counts: Record<string, number> = { hotel, flight, train, experience, package: pkg, cruise, blogPost, customer };

  const Tile = ({ href, n, label, Icon, grad, ring, ink }: { href: string; n: number; label: string; Icon: typeof Inbox; grad: string; ring: string; ink: string }) => (
    <Link href={href} className={`relative block rounded-xl p-5 border bg-gradient-to-br ${grad} ${ring} hover:shadow-md transition-shadow`}>
      <Icon size={20} className={`${ink} mb-3`} />
      <p className={`text-3xl font-semibold ${ink}`}>{n}</p>
      <p className="text-sm text-gray-600 mt-0.5">{label}</p>
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
            <Link key={q.href} href={q.href} className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800">
              <Plus size={14} /> {q.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Tile href="/admin/bookings" n={pendingBookings} label={`Pending ${pendingBookings === 1 ? "booking" : "bookings"}`} Icon={CalendarCheck} grad="from-amber-50 to-orange-100" ring="border-amber-200" ink="text-amber-700" />
        <Tile href="/admin/enquiries" n={newEnquiries} label={`New ${newEnquiries === 1 ? "enquiry" : "enquiries"}`} Icon={Inbox} grad="from-sky-50 to-blue-100" ring="border-sky-200" ink="text-sky-700" />
        <Tile href="/admin/reviews" n={pendingReviews} label={`${pendingReviews === 1 ? "Review" : "Reviews"} to moderate`} Icon={Star} grad="from-rose-50 to-pink-100" ring="border-rose-200" ink="text-rose-700" />
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-900 flex items-center gap-2"><CalendarCheck size={15} className="text-emerald-600" /> Latest bookings</p>
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
            <p className="text-sm font-medium text-gray-900 flex items-center gap-2"><Inbox size={15} className="text-sky-600" /> Latest enquiries</p>
            <Link href="/admin/enquiries" className="text-xs text-gray-500 hover:text-gray-900 inline-flex items-center gap-1">All <ArrowRight size={12} /></Link>
          </div>
          {recentEnquiries.length === 0 ? <p className="text-sm text-gray-400">No enquiries yet.</p> : (
            <ul className="divide-y divide-gray-100">
              {recentEnquiries.map(e => (
                <li key={e.id} className="py-2.5 flex items-center gap-3">
                  <span className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 shrink-0">{e.type}</span>
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
            <Link key={c.key} href={c.href} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-gray-300 transition-all">
              <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg mb-3 ${c.tint}`}><c.icon size={18} /></span>
              <p className="text-2xl font-semibold text-gray-900">{counts[c.key]}</p>
              <p className="text-sm text-gray-500 mt-0.5">{c.label}</p>
            </Link>
          ))}
          <Link href="/admin/newsletter" className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-gray-300 transition-all">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg mb-3 bg-fuchsia-50 text-fuchsia-600"><Mail size={18} /></span>
            <p className="text-2xl font-semibold text-gray-900">{newsletter}</p>
            <p className="text-sm text-gray-500 mt-0.5">Subscribers</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
