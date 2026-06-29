import { prisma } from "@/lib/prisma";
import OffersManager from "@/components/admin/OffersManager";

export const dynamic = "force-dynamic";

export default async function AdminOffersPage() {
  const items = await prisma.offer.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">Offers</h1>
      <p className="text-sm text-gray-500 mb-5">Shown on the public Offers page. Mark an offer &ldquo;member-only&rdquo; to reveal it only to signed-in customers.</p>
      <OffersManager items={items} />
    </div>
  );
}
