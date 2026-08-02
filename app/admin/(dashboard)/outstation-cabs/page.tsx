import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DataTable from "@/components/admin/DataTable";

export default async function AdminOutstationCabsPage() {
  const cabs = await prisma.outstationCab.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, originCity: true, destinationCity: true, price: true, published: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Outstation Cabs</h1>
        <Link href="/admin/outstation-cabs/new" className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-md">
          + Add Outstation Cab
        </Link>
      </div>
      <DataTable
        rows={cabs}
        basePath="/admin/outstation-cabs"
        apiPath="/api/admin/outstation-cabs"
        columns={[
          { key: "title", label: "Title" },
          { key: "originCity", label: "From" },
          { key: "destinationCity", label: "To" },
          { key: "price", label: "Price" },
        ]}
      />
    </div>
  );
}
