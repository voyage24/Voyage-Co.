import { prisma } from "@/lib/prisma";
import EnquiriesList from "@/components/admin/EnquiriesList";

export const dynamic = "force-dynamic";

export default async function AdminEnquiriesPage() {
  const enquiries = await prisma.enquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">Enquiries</h1>
      <p className="text-sm text-gray-500 mb-5 max-w-2xl">
        Every contact-form message and reservation request from the website lands here.
        Mark each as handled once you&apos;ve followed up.
      </p>
      <EnquiriesList enquiries={enquiries} />
    </div>
  );
}
