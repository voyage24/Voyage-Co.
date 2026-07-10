import { prisma } from "@/lib/prisma";
import NewsletterComposer from "@/components/admin/NewsletterComposer";
import NewsletterSubscribers from "@/components/admin/NewsletterSubscribers";

export const dynamic = "force-dynamic";

export default async function MailNewsletterPage() {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
    select: { email: true, createdAt: true },
  });
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-gray-900">Newsletter</h1>
        <span className="text-sm text-gray-500">{subscribers.length} subscriber{subscribers.length === 1 ? "" : "s"}</span>
      </div>
      <NewsletterSubscribers subscribers={subscribers} />
      <NewsletterComposer />
    </div>
  );
}
