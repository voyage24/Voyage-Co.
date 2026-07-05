import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { COLLECTION_BY_TYPE } from "@/lib/collections";
import CollectionManager from "@/components/admin/CollectionManager";

export const dynamic = "force-dynamic";

export default async function AdminCollectionType({ params }: { params: { type: string } }) {
  const def = COLLECTION_BY_TYPE.get(params.type);
  if (!def) notFound();

  const rows = await prisma.collection.findMany({
    where: { type: params.type },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  const items = rows.map(r => ({ id: r.id, data: (r.data as Record<string, string>) ?? {}, published: r.published, sortOrder: r.sortOrder }));

  return (
    <div className="space-y-6">
      <Link href="/admin/collections" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"><ArrowLeft size={15} /> All collections</Link>
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{def.label}</h1>
        {def.description && <p className="text-sm text-gray-500">{def.description}</p>}
      </div>
      <CollectionManager def={def} items={items} />
    </div>
  );
}
