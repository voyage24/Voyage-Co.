import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DataTable from "@/components/admin/DataTable";
import SyncCatalogButton from "@/components/admin/SyncCatalogButton";

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { updatedAt: "desc" },
    select: { slug: true, title: true, category: true, author: true, date: true, published: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Blog Posts</h1>
        <Link href="/admin/blog/new" className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-md">
          + Add Post
        </Link>
      </div>
      <div className="mb-6">
        <SyncCatalogButton endpoint="/api/admin/blog/sync" label="Sync Full Catalog (repair / add missing)" />
      </div>
      <DataTable
        rows={posts}
        basePath="/admin/blog"
        apiPath="/api/admin/blog"
        idField="slug"
        columns={[
          { key: "title", label: "Title" },
          { key: "category", label: "Category" },
          { key: "author", label: "Author" },
          { key: "date", label: "Date" },
        ]}
      />
    </div>
  );
}
