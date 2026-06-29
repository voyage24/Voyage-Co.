import { prisma } from "@/lib/prisma";
import MomentsManager from "@/components/admin/MomentsManager";

export const dynamic = "force-dynamic";

export default async function AdminMomentsPage() {
  const items = await prisma.moment.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">Moments</h1>
      <p className="text-sm text-gray-500 mb-5">A gallery of guest photos &amp; travel moments shown on the homepage.</p>
      <MomentsManager items={items} />
    </div>
  );
}
