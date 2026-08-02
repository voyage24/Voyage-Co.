import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import HourlyStayForm from "@/components/admin/HourlyStayForm";

export default async function EditHourlyStayPage({ params }: { params: { id: string } }) {
  const stay = await prisma.hourlyStay.findUnique({ where: { id: params.id } });
  if (!stay) notFound();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit Hourly Stay</h1>
      <HourlyStayForm initial={{ ...stay, faqs: stay.faqs as { q: string; a: string }[] | null }} />
    </div>
  );
}
