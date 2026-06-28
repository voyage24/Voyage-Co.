import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PackageForm from "@/components/admin/PackageForm";

export default async function EditPackagePage({ params }: { params: { id: string } }) {
  const pkg = await prisma.package.findUnique({ where: { id: params.id } });
  if (!pkg) notFound();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit Package</h1>
      <PackageForm initial={{ ...pkg, faqs: pkg.faqs as { q: string; a: string }[] | null }} />
    </div>
  );
}
