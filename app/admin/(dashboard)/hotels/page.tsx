import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DataTable from "@/components/admin/DataTable";
import SyncCatalogButton from "@/components/admin/SyncCatalogButton";

export default async function AdminHotelsPage() {
  const hotels = await prisma.hotel.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Hotels</h1>
        <Link href="/admin/hotels/new" className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-md">
          + Add Hotel
        </Link>
      </div>
      <div className="mb-6">
        <SyncCatalogButton endpoint="/api/admin/hotels/sync" label="Sync Full Catalog (repair / add missing)" />
      </div>
      <DataTable
        rows={hotels}
        basePath="/admin/hotels"
        apiPath="/api/admin/hotels"
        columns={[
          { key: "name", label: "Name" },
          { key: "city", label: "City" },
          { key: "country", label: "Country" },
          { key: "pricePerNight", label: "Price/Night" },
        ]}
      />
    </div>
  );
}
