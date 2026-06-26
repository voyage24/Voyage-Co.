import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DataTable from "@/components/admin/DataTable";
import SyncCatalogButton from "@/components/admin/SyncCatalogButton";

export default async function AdminExperiencesPage() {
  const experiences = await prisma.experience.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Experiences</h1>
        <Link href="/admin/experiences/new" className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-md">
          + Add Experience
        </Link>
      </div>
      <div className="mb-6">
        <SyncCatalogButton endpoint="/api/admin/experiences/sync" label="Sync Full Catalog (repair / add missing)" />
      </div>
      <DataTable
        rows={experiences}
        basePath="/admin/experiences"
        apiPath="/api/admin/experiences"
        columns={[
          { key: "title", label: "Title" },
          { key: "location", label: "Location" },
          { key: "category", label: "Category" },
          { key: "price", label: "Price" },
        ]}
      />
    </div>
  );
}
