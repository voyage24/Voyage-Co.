import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AirportCabForm from "@/components/admin/AirportCabForm";

export default async function EditAirportCabPage({ params }: { params: { id: string } }) {
  const cab = await prisma.airportCab.findUnique({ where: { id: params.id } });
  if (!cab) notFound();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit Airport Cab</h1>
      <AirportCabForm initial={{ ...cab, faqs: cab.faqs as { q: string; a: string }[] | null }} />
    </div>
  );
}
