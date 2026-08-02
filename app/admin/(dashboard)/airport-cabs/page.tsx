import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DataTable from "@/components/admin/DataTable";

export default async function AdminAirportCabsPage() {
  const cabs = await prisma.airportCab.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, city: true, vehicleType: true, price: true, published: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Airport Cabs</h1>
        <Link href="/admin/airport-cabs/new" className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-md">
          + Add Airport Cab
        </Link>
      </div>
      <DataTable
        rows={cabs}
        basePath="/admin/airport-cabs"
        apiPath="/api/admin/airport-cabs"
        columns={[
          { key: "title", label: "Title" },
          { key: "city", label: "City" },
          { key: "vehicleType", label: "Vehicle" },
          { key: "price", label: "Price" },
        ]}
      />
    </div>
  );
}
