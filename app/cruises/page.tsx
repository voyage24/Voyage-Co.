import { prisma } from "@/lib/prisma";
import CruisesPageClient from "@/components/pages/CruisesPageClient";
import { safeQuery } from "@/lib/safe-query";

export const revalidate = 60;

export default async function CruisesPage() {
  const cruises = await safeQuery(() => prisma.cruise.findMany({ where: { published: true } }), []);
  return <CruisesPageClient cruises={cruises} />;
}
