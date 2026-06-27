import Link from "next/link";
import { prisma } from "@/lib/prisma";
import NewsletterGenerateButton from "@/components/admin/NewsletterGenerateButton";

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
  const [issues, subscriberCount] = await Promise.all([
    prisma.newsletter.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.newsletterSubscriber.count(),
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <h1 className="text-2xl font-semibold text-gray-900">Newsletter</h1>
        <span className="text-sm text-gray-500">{subscriberCount} subscriber{subscriberCount === 1 ? "" : "s"}</span>
      </div>
      <p className="text-sm text-gray-500 mb-5 max-w-2xl">
        Each week a draft is curated automatically from your live content (or generate one now).
        Review it, then send to all subscribers with one click. Nothing is sent without your approval.
      </p>

      <div className="mb-6">
        <NewsletterGenerateButton />
      </div>

      {issues.length === 0 ? (
        <p className="text-sm text-gray-400 border border-dashed border-gray-200 rounded-md p-8 text-center">
          No newsletters yet. Generate this week&apos;s draft to get started.
        </p>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-md">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Subject</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Recipients</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {issues.map(issue => (
                <tr key={issue.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900 max-w-xs truncate">{issue.subject}</td>
                  <td className="px-4 py-3">
                    {issue.status === "sent" ? (
                      <span className="inline-block text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Sent</span>
                    ) : (
                      <span className="inline-block text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Draft</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(issue.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-gray-500">{issue.status === "sent" ? issue.recipientCount : "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/newsletter/${issue.id}`} className="text-gray-900 font-medium hover:underline">
                      {issue.status === "sent" ? "View" : "Review & send"}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
