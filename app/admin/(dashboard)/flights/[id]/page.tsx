import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import FlightForm from "@/components/admin/FlightForm";

export default async function EditFlightPage({ params }: { params: { id: string } }) {
  const flight = await prisma.flight.findUnique({ where: { id: params.id } });
  if (!flight) notFound();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit Flight</h1>
      <FlightForm initial={flight} />
    </div>
  );
}
