import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CruiseForm from "@/components/admin/CruiseForm";

export default async function EditCruisePage({ params }: { params: { id: string } }) {
  const cruise = await prisma.cruise.findUnique({ where: { id: params.id } });
  if (!cruise) notFound();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit Cruise</h1>
      <CruiseForm initial={cruise} />
    </div>
  );
}
