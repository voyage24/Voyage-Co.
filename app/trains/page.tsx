import { prisma } from "@/lib/prisma";
import TrainsPageClient from "@/components/pages/TrainsPageClient";

export const dynamic = "force-dynamic";

export default async function TrainsPage() {
  const trains = await prisma.train.findMany({ where: { published: true } });
  return <TrainsPageClient trains={trains as any} />;
}
