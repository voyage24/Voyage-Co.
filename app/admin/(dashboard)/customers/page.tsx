import { prisma } from "@/lib/prisma";
import CustomersList from "@/components/admin/CustomersList";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    select: {
      id: true, name: true, email: true, phone: true, tier: true, createdAt: true, lastLoginAt: true,
      _count: { select: { bookings: true } },
    },
  });

  const rows = customers.map(c => ({
    id: c.id, name: c.name, email: c.email, phone: c.phone, tier: c.tier,
    createdAt: c.createdAt, lastLoginAt: c.lastLoginAt, bookings: c._count.bookings,
  }));

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-1">
        <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
        <a href="/api/admin/export?type=customers" className="text-xs px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 shrink-0">Export CSV</a>
      </div>
      <p className="text-sm text-gray-500 mb-5">Registered accounts and how many bookings each has made.</p>
      <CustomersList customers={rows} />
    </div>
  );
}
