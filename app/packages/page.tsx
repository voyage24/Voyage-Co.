import { prisma } from "@/lib/prisma";
import PackagesPageClient from "@/components/pages/PackagesPageClient";
import { safeQuery } from "@/lib/safe-query";

export const revalidate = 60;

export default async function PackagesPage() {
  const packages = await safeQuery(() => prisma.package.findMany({ where: { published: true } }), []);
  return <PackagesPageClient packages={packages} />;
}
