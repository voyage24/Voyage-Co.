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
      <div className="flex items-start justify-between gap-3 mb-1">
        <h1 className="text-2xl font-semibold text-gray-900">Enquiries</h1>
        <a href="/api/admin/export?type=enquiries" className="text-xs px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 shrink-0">Export CSV</a>
      </div>
      <p className="text-sm text-gray-500 mb-5 max-w-2xl">
        Every contact-form message and reservation request from the website lands here.
        Mark each as handled once you&apos;ve followed up.
      </p>
      <EnquiriesList enquiries={enquiries} />
    </div>
  );
}
