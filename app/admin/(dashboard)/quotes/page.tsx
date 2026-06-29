import Link from "next/link";
import { prisma } from "@/lib/prisma";
import QuotesList from "@/components/admin/QuotesList";

export const dynamic = "force-dynamic";

export default async function AdminQuotesPage() {
  const quotes = await prisma.quote.findMany({ orderBy: { updatedAt: "desc" }, take: 500 });

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Quotes</h1>
          <p className="text-sm text-gray-500">Build a quote, set it to “Sent”, then share the link. Customers accept online.</p>
        </div>
        <Link href="/admin/quotes/new" className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-md">New quote</Link>
      </div>
      <QuotesList quotes={quotes} />
    </div>
  );
}
