import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { COLLECTIONS } from "@/lib/collections";

export const dynamic = "force-dynamic";

export default async function AdminCollectionsIndex() {
  const counts = await prisma.collection.groupBy({ by: ["type"], _count: { _all: true } }).catch(() => []);
  const countByType = new Map(counts.map(c => [c.type, c._count._all]));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Collections</h1>
        <p className="text-sm text-gray-500">Add, edit and reorder team members, events, partner logos and the homepage FAQ.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {COLLECTIONS.map((cn, i) => (
          <Link key={cn.type} href={`/admin/collections/${cn.type}`} className={`admin-rise admin-lift rounded-xl p-5 block tile-grad-${(i % 6) + 1}`}>
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg mb-3 bg-black/[0.06] dark:bg-white/10 text-gray-700"><LayoutGrid size={18} /></span>
            <p className="font-medium text-gray-900">{cn.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{countByType.get(cn.type) ?? 0} items</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
