import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DataTable from "@/components/admin/DataTable";

export default async function AdminFlightsPage() {
  const flights = await prisma.flight.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Flights</h1>
        <Link href="/admin/flights/new" className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-md">
          + Add Flight
        </Link>
      </div>
      <DataTable
        rows={flights}
        basePath="/admin/flights"
        apiPath="/api/admin/flights"
        columns={[
          { key: "airline", label: "Airline" },
          { key: "origin", label: "Origin" },
          { key: "destination", label: "Destination" },
          { key: "price", label: "Price" },
        ]}
      />
    </div>
  );
}
