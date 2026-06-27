import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DataTable from "@/components/admin/DataTable";
import SyncCatalogButton from "@/components/admin/SyncCatalogButton";

export default async function AdminPackagesPage() {
  const packages = await prisma.package.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, subtitle: true, duration: true, pricePerPerson: true, published: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Packages</h1>
        <Link href="/admin/packages/new" className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-md">
          + Add Package
        </Link>
      </div>
      <div className="mb-6">
        <SyncCatalogButton endpoint="/api/admin/packages/import-curated" label="Sync Full Catalog (repair / add missing)" />
      </div>
      <DataTable
        rows={packages}
        basePath="/admin/packages"
        apiPath="/api/admin/packages"
        columns={[
          { key: "title", label: "Title" },
          { key: "subtitle", label: "Destinations" },
          { key: "duration", label: "Duration" },
          { key: "pricePerPerson", label: "Price/Person" },
        ]}
      />
    </div>
  );
}
