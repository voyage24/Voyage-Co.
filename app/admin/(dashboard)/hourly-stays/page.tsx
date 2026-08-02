import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DataTable from "@/components/admin/DataTable";

export default async function AdminHourlyStaysPage() {
  const stays = await prisma.hourlyStay.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, city: true, hours: true, price: true, published: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Hourly Stays</h1>
        <Link href="/admin/hourly-stays/new" className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-md">
          + Add Hourly Stay
        </Link>
      </div>
      <DataTable
        rows={stays}
        basePath="/admin/hourly-stays"
        apiPath="/api/admin/hourly-stays"
        columns={[
          { key: "title", label: "Title" },
          { key: "city", label: "City" },
          { key: "hours", label: "Hours" },
          { key: "price", label: "Price" },
        ]}
      />
    </div>
  );
}
