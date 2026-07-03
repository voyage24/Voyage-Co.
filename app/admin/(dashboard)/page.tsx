import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Plus, ArrowRight, CalendarCheck, Inbox, Star, BedDouble, Package, Sparkles,
  Ship, Plane, TrainFront, Newspaper, Users, Mail, Eye,
} from "lucide-react";
import MiniAreaChart from "@/components/admin/MiniAreaChart";

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

  // Visitor metrics (day-bucketed + device split).
  const [visitStat, dailyVisits, mobileStat, desktopStat] = await Promise.all([
    prisma.siteStat.findUnique({ where: { key: "visits" } }).catch(() => null),
    prisma.dailyVisit.findMany({ orderBy: { day: "desc" }, take: 60 }).catch(() => []),
    prisma.siteStat.findUnique({ where: { key: "visits:mobile" } }).catch(() => null),
    prisma.siteStat.findUnique({ where: { key: "visits:desktop" } }).catch(() => null),
  ]);
  const mobileVisits = mobileStat?.count ?? 0;
  const desktopVisits = desktopStat?.count ?? 0;
  const visitMap = new Map(dailyVisits.map(d => [d.day, d.count]));
  const visitDays: { label: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const dt = new Date(); dt.setHours(0, 0, 0, 0); dt.setDate(dt.getDate() - i);
    visitDays.push({ label: dt.toLocaleDateString("en-US", { day: "numeric", month: "short" }), count: visitMap.get(dt.toISOString().slice(0, 10)) ?? 0 });
  }
  const totalVisits = visitStat?.count ?? 0;
  const todayVisits = visitMap.get(new Date().toISOString().slice(0, 10)) ?? 0;
  const weekVisits = visitDays.slice(-7).reduce((s, d) => s + d.count, 0);

  const Tile = ({ href, n, label, Icon, grad }: { href: string; n: number; label: string; Icon: typeof Inbox; grad: string }) => (
    <Link href={href} className={`admin-rise admin-lift relative block rounded-xl p-5 text-gray-900 ${grad}`}>
      <Icon size={20} className="mb-3 text-gray-700" />
      <p className="text-3xl font-bold">{n}</p>
      <p className="text-sm mt-0.5 text-gray-600">{label}</p>
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
            <Link key={q.href} href={q.href} className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-700 dark:bg-white/[0.12] dark:hover:bg-white/20 transition-colors">
              <Plus size={14} /> {q.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Tile href="/admin/bookings" n={pendingBookings} label={`Pending ${pendingBookings === 1 ? "booking" : "bookings"}`} Icon={CalendarCheck} grad="tile-grad-1" />
        <Tile href="/admin/enquiries" n={newEnquiries} label={`New ${newEnquiries === 1 ? "enquiry" : "enquiries"}`} Icon={Inbox} grad="tile-grad-2" />
        <Tile href="/admin/reviews" n={pendingReviews} label={`${pendingReviews === 1 ? "Review" : "Reviews"} to moderate`} Icon={Star} grad="tile-grad-3" />
      </div>

      {/* Visitors */}
      <div className="tile-grad-4 rounded-xl p-5 admin-rise admin-lift">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <p className="text-sm font-medium text-gray-900 flex items-center gap-2"><Eye size={15} className="text-gray-900" /> Visitors</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-right">
            <div><p className="text-xl font-bold text-gray-900">{totalVisits.toLocaleString("en-IN")}</p><p className="text-[10px] uppercase tracking-wide text-gray-500">Total</p></div>
            <div><p className="text-xl font-bold text-gray-900">{todayVisits.toLocaleString("en-IN")}</p><p className="text-[10px] uppercase tracking-wide text-gray-500">Today</p></div>
            <div><p className="text-xl font-bold text-gray-900">{weekVisits.toLocaleString("en-IN")}</p><p className="text-[10px] uppercase tracking-wide text-gray-500">Last 7 days</p></div>
            <div><p className="text-xl font-bold text-gray-900">{mobileVisits.toLocaleString("en-IN")}</p><p className="text-[10px] uppercase tracking-wide text-gray-500">Mobile</p></div>
            <div><p className="text-xl font-bold text-gray-900">{desktopVisits.toLocaleString("en-IN")}</p><p className="text-[10px] uppercase tracking-wide text-gray-500">Desktop</p></div>
          </div>
        </div>
        <MiniAreaChart data={visitDays} />
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="tile-grad-5 rounded-xl p-5 admin-rise admin-lift">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-900 flex items-center gap-2"><CalendarCheck size={15} className="text-gray-900" /> Latest bookings</p>
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
        <div className="tile-grad-6 rounded-xl p-5 admin-rise admin-lift">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-900 flex items-center gap-2"><Inbox size={15} className="text-gray-900" /> Latest enquiries</p>
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
          {CARDS.map((c, i) => (
            <Link key={c.key} href={c.href} className={`admin-rise admin-lift rounded-xl p-5 tile-grad-${7 + i}`}>
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg mb-3 bg-black/[0.06] dark:bg-white/10 text-gray-700"><c.icon size={18} /></span>
              <p className="text-2xl font-bold text-gray-900">{counts[c.key]}</p>
              <p className="text-sm text-gray-500 mt-0.5">{c.label}</p>
            </Link>
          ))}
          <Link href="/admin/newsletter" className="admin-rise admin-lift rounded-xl p-5 tile-grad-15">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg mb-3 bg-black/[0.06] dark:bg-white/10 text-gray-700"><Mail size={18} /></span>
            <p className="text-2xl font-bold text-gray-900">{newsletter}</p>
            <p className="text-sm text-gray-500 mt-0.5">Subscribers</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
