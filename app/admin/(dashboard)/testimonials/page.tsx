import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DataTable from "@/components/admin/DataTable";

export default async function AdminTestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, author: true, detail: true, rating: true, published: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Testimonials</h1>
        <Link href="/admin/testimonials/new" className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-md">
          + Add Testimonial
        </Link>
      </div>
      <DataTable
        rows={testimonials}
        basePath="/admin/testimonials"
        apiPath="/api/admin/testimonials"
        columns={[
          { key: "author", label: "Author" },
          { key: "detail", label: "Detail" },
          { key: "rating", label: "Rating" },
        ]}
      />
    </div>
  );
}
