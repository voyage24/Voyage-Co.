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
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">Customers</h1>
      <p className="text-sm text-gray-500 mb-5">Registered accounts and how many bookings each has made.</p>
      <CustomersList customers={rows} />
    </div>
  );
}
