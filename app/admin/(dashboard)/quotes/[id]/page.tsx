import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import QuoteForm from "@/components/admin/QuoteForm";

export default async function EditQuotePage({ params }: { params: { id: string } }) {
  const quote = await prisma.quote.findUnique({ where: { id: params.id } });
  if (!quote) notFound();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit Quote</h1>
      <QuoteForm initial={{ ...quote, lineItems: quote.lineItems as { label: string; amount: number }[] }} />
    </div>
  );
}
