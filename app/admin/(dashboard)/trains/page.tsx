import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DataTable from "@/components/admin/DataTable";

export default async function AdminTrainsPage() {
  const trains = await prisma.train.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Trains</h1>
        <Link href="/admin/trains/new" className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-md">
          + Add Train
        </Link>
      </div>
      <DataTable
        rows={trains}
        basePath="/admin/trains"
        apiPath="/api/admin/trains"
        columns={[
          { key: "name", label: "Name" },
          { key: "origin", label: "Origin" },
          { key: "destination", label: "Destination" },
          { key: "duration", label: "Duration" },
        ]}
      />
    </div>
  );
}
