import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import NewsletterSendButton from "@/components/admin/NewsletterSendButton";
import { UNSUBSCRIBE_PLACEHOLDER } from "@/lib/newsletter/compose";

export const dynamic = "force-dynamic";

export default async function NewsletterDetailPage({ params }: { params: { id: string } }) {
  const [issue, subscriberCount] = await Promise.all([
    prisma.newsletter.findUnique({ where: { id: params.id } }),
    prisma.newsletterSubscriber.count(),
  ]);
  if (!issue) notFound();

  // Neutralise the per-recipient unsubscribe placeholder for the preview.
  const previewHtml = issue.html.split(UNSUBSCRIBE_PLACEHOLDER).join("#");

  return (
    <div>
      <Link href="/admin/newsletter" className="text-sm text-gray-500 hover:text-gray-900 mb-4 inline-block">← Back to newsletters</Link>

      <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
        <h1 className="text-xl font-semibold text-gray-900 max-w-2xl">{issue.subject}</h1>
        {issue.status === "sent" ? (
          <span className="inline-block text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
            Sent to {issue.recipientCount} · {issue.sentAt ? new Date(issue.sentAt).toLocaleString() : ""}
          </span>
        ) : (
          <span className="inline-block text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded">Draft</span>
        )}
      </div>

      {issue.status !== "sent" && (
        <div className="my-5">
          <NewsletterSendButton id={issue.id} subscriberCount={subscriberCount} />
        </div>
      )}

      <p className="text-xs text-gray-400 mb-2 mt-6">Preview</p>
      <div className="border border-gray-200 rounded-md overflow-hidden bg-white">
        <iframe srcDoc={previewHtml} title="Newsletter preview" className="w-full" style={{ height: "80vh", border: "none" }} />
      </div>
    </div>
  );
}
