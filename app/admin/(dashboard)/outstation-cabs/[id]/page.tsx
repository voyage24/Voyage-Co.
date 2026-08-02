import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import OutstationCabForm from "@/components/admin/OutstationCabForm";

export default async function EditOutstationCabPage({ params }: { params: { id: string } }) {
  const cab = await prisma.outstationCab.findUnique({ where: { id: params.id } });
  if (!cab) notFound();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit Outstation Cab</h1>
      <OutstationCabForm initial={{ ...cab, faqs: cab.faqs as { q: string; a: string }[] | null }} />
    </div>
  );
}
