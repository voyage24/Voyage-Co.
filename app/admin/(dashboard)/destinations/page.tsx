import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DataTable from "@/components/admin/DataTable";

export default async function AdminDestinationsPage() {
  const destinations = await prisma.featuredDestination.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Featured Destinations</h1>
        <Link href="/admin/destinations/new" className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-md">
          + Add Destination
        </Link>
      </div>
      <DataTable
        rows={destinations}
        basePath="/admin/destinations"
        apiPath="/api/admin/destinations"
        columns={[
          { key: "name", label: "Name" },
          { key: "country", label: "Country" },
          { key: "tagline", label: "Tagline" },
          { key: "hotelCount", label: "Hotel Count" },
        ]}
      />
    </div>
  );
}
