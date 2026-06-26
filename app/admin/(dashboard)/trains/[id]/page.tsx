import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TrainForm from "@/components/admin/TrainForm";

export default async function EditTrainPage({ params }: { params: { id: string } }) {
  const train = await prisma.train.findUnique({ where: { id: params.id } });
  if (!train) notFound();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit Train</h1>
      <TrainForm initial={train as any} />
    </div>
  );
}
