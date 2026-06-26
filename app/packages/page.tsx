import { prisma } from "@/lib/prisma";
import PackagesPageClient from "@/components/pages/PackagesPageClient";

export const dynamic = "force-dynamic";

export default async function PackagesPage() {
  const packages = await prisma.package.findMany({ where: { published: true } });
  return <PackagesPageClient packages={packages} />;
}
