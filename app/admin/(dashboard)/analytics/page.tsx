import { prisma } from "@/lib/prisma";
import MiniAreaChart from "@/components/admin/MiniAreaChart";

export const dynamic = "force-dynamic";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white border border-gray-200 border-l-4 border-l-[#E6E800] rounded-lg p-4 admin-lift admin-rise">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default async function AnalyticsPage() {
  const [bookings, enquiries, customerCount, newsletterCount] = await Promise.all([
    prisma.booking.findMany({ select: { total: true, status: true, type: true, itemTitle: true, createdAt: true } }),
    prisma.enquiry.findMany({ select: { stage: true, createdAt: true, total: true } }),
    prisma.customer.count(),
    prisma.newsletterSubscriber.count().catch(() => 0),
  ]);

  const confirmed = bookings.filter(b => b.status === "confirmed");
  const revenue = confirmed.reduce((s, b) => s + (b.total || 0), 0);
  const pipelineRevenue = bookings.filter(b => b.status === "pending").reduce((s, b) => s + (b.total || 0), 0);

  const statusCounts = bookings.reduce<Record<string, number>>((m, b) => { m[b.status] = (m[b.status] || 0) + 1; return m; }, {});
  const stageCounts = enquiries.reduce<Record<string, number>>((m, e) => { m[e.stage] = (m[e.stage] || 0) + 1; return m; }, {});
  const wonRate = enquiries.length ? Math.round(((stageCounts.won || 0) / enquiries.length) * 100) : 0;

  // Top items by booking count + revenue.
  const itemMap = new Map<string, { count: number; revenue: number; type: string }>();
  for (const b of bookings) {
    const cur = itemMap.get(b.itemTitle) ?? { count: 0, revenue: 0, type: b.type };
    cur.count += 1;
    if (b.status === "confirmed") cur.revenue += b.total || 0;
    itemMap.set(b.itemTitle, cur);
  }
  const topItems = Array.from(itemMap.entries()).sort((a, b) => b[1].count - a[1].count).slice(0, 8);

  // Bookings per day, last 14 days.
  const days: { label: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i);
    const next = new Date(d); next.setDate(next.getDate() + 1);
    const count = bookings.filter(b => b.createdAt >= d && b.createdAt < next).length;
    days.push({ label: d.toLocaleDateString("en-US", { day: "numeric", month: "short" }), count });
  }

  // Confirmed revenue per day, last 14 days.
  const revDays: { label: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i);
    const next = new Date(d); next.setDate(next.getDate() + 1);
    const total = confirmed.filter(b => b.createdAt >= d && b.createdAt < next).reduce((s, b) => s + (b.total || 0), 0);
    revDays.push({ label: d.toLocaleDateString("en-US", { day: "numeric", month: "short" }), count: total });
  }
  const compactInr = (n: number) =>
    n >= 1e7 ? `₹${(n / 1e7).toFixed(1)}Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(1)}L` : n >= 1e3 ? `₹${Math.round(n / 1e3)}k` : `₹${n}`;

  const STAGES = ["new", "contacted", "quoted", "won", "lost"];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Analytics</h1>
        <p className="text-sm text-gray-500">A live snapshot of bookings, revenue and your enquiry pipeline.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Confirmed revenue" value={inr(revenue)} sub={`${confirmed.length} confirmed bookings`} />
        <Stat label="In pipeline" value={inr(pipelineRevenue)} sub={`${statusCounts.pending || 0} pending`} />
        <Stat label="Enquiries" value={String(enquiries.length)} sub={`${wonRate}% won`} />
        <Stat label="Customers" value={String(customerCount)} sub={`${newsletterCount} newsletter subs`} />
      </div>

      {/* Trend graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-5 admin-rise admin-lift">
          <p className="text-sm font-medium text-gray-900 mb-4">Bookings — last 14 days</p>
          <MiniAreaChart data={days} />
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-5 admin-rise admin-lift">
          <p className="text-sm font-medium text-gray-900 mb-4">Confirmed revenue — last 14 days</p>
          <MiniAreaChart data={revDays} format={compactInr} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 admin-rise admin-lift">
          <p className="text-sm font-medium text-gray-900 mb-4">Enquiry pipeline</p>
          <div className="space-y-2">
            {STAGES.map(s => {
              const c = stageCounts[s] || 0;
              const pct = enquiries.length ? Math.round((c / enquiries.length) * 100) : 0;
              return (
                <div key={s} className="flex items-center gap-3">
                  <span className="w-20 text-xs text-gray-500 capitalize">{s}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-[#E6E800] h-full rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-10 text-right text-xs text-gray-600">{c}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top items */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 admin-rise admin-lift">
          <p className="text-sm font-medium text-gray-900 mb-4">Most-booked</p>
          {topItems.length === 0 ? (
            <p className="text-sm text-gray-400">No bookings yet.</p>
          ) : (
            <div className="space-y-2">
              {topItems.map(([title, v]) => (
                <div key={title} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-gray-700 truncate">{title}</span>
                  <span className="text-gray-400 shrink-0">{v.count}× · {inr(v.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
