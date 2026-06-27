import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DataTable from "@/components/admin/DataTable";
import SyncCatalogButton from "@/components/admin/SyncCatalogButton";

export default async function AdminCruisesPage() {
  const cruises = await prisma.cruise.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, cruiseLine: true, region: true, pricePerPerson: true, published: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Cruises</h1>
        <Link href="/admin/cruises/new" className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-md">
          + Add Cruise
        </Link>
      </div>
      <div className="mb-6">
        <SyncCatalogButton endpoint="/api/admin/cruises/sync" label="Sync Full Catalog (repair / add missing)" />
      </div>
      <DataTable
        rows={cruises}
        basePath="/admin/cruises"
        apiPath="/api/admin/cruises"
        columns={[
          { key: "name", label: "Name" },
          { key: "cruiseLine", label: "Cruise Line" },
          { key: "region", label: "Region" },
          { key: "pricePerPerson", label: "Price/Person" },
        ]}
      />
    </div>
  );
}
