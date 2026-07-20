import { prisma } from "@/lib/prisma";
import TrainsPageClient from "@/components/pages/TrainsPageClient";
import { safeQuery } from "@/lib/safe-query";

export const revalidate = 60;

export default async function TrainsPage() {
  const trains = await safeQuery(() => prisma.train.findMany({ where: { published: true } }), []);
  return <TrainsPageClient trains={trains as any} />;
}
