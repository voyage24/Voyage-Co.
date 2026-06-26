import { prisma } from "@/lib/prisma";
import CruisesPageClient from "@/components/pages/CruisesPageClient";

export const dynamic = "force-dynamic";

export default async function CruisesPage() {
  const cruises = await prisma.cruise.findMany({ where: { published: true } });
  return <CruisesPageClient cruises={cruises} />;
}
