import { prisma } from "@/lib/prisma";
import TrainsPageClient from "@/components/pages/TrainsPageClient";

export const revalidate = 60;

export default async function TrainsPage() {
  const trains = await prisma.train.findMany({ where: { published: true } });
  return <TrainsPageClient trains={trains as any} />;
}
