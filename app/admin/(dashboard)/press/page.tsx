import { prisma } from "@/lib/prisma";
import PressManager from "@/components/admin/PressManager";

export const dynamic = "force-dynamic";

export default async function AdminPressPage() {
  const items = await prisma.pressMention.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">Press &amp; Awards</h1>
      <p className="text-sm text-gray-500 mb-5">Logos shown in the &ldquo;As featured in&rdquo; strip on the homepage.</p>
      <PressManager items={items} />
    </div>
  );
}
