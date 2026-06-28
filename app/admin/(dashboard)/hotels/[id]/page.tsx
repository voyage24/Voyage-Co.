import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import HotelForm from "@/components/admin/HotelForm";

export default async function EditHotelPage({ params }: { params: { id: string } }) {
  const hotel = await prisma.hotel.findUnique({ where: { id: params.id } });
  if (!hotel) notFound();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit Hotel</h1>
      <HotelForm initial={{ ...hotel, faqs: hotel.faqs as { q: string; a: string }[] | null }} />
    </div>
  );
}
