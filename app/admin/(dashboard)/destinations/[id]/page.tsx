import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DestinationForm from "@/components/admin/DestinationForm";

export default async function EditDestinationPage({ params }: { params: { id: string } }) {
  const destination = await prisma.featuredDestination.findUnique({ where: { id: params.id } });
  if (!destination) notFound();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit Featured Destination</h1>
      <DestinationForm initial={destination} />
    </div>
  );
}
