import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DataTable from "@/components/admin/DataTable";

export default async function AdminPackagesPage() {
  const packages = await prisma.package.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Packages</h1>
        <Link href="/admin/packages/new" className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-md">
          + Add Package
        </Link>
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
