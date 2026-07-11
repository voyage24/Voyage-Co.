import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import QuoteActions from "@/components/quote/QuoteActions";
import PrintButton from "@/components/quote/PrintButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Your Quote — Voyages & Co.", robots: { index: false } };

type Line = { label: string; amount: number };

export default async function QuotePage({ params }: { params: { token: string } }) {
  const quote = await prisma.quote.findUnique({ where: { token: params.token } });
  if (!quote || quote.status === "draft") notFound();

  const lines = (quote.lineItems as Line[]) ?? [];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <div className="text-center mb-8">
        <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-2">Your bespoke quote</p>
        <h1 className="font-serif text-3xl sm:text-4xl font-light text-ink">{quote.title}</h1>
        <p className="text-ink-muted font-light mt-2">Prepared for {quote.customerName}</p>
      </div>

      <div className="bg-panel border border-line rounded-2xl shadow-card overflow-hidden print-shadow-none">
        <div className="p-6 sm:p-8">
          <table className="w-full">
            <tbody>
              {lines.map((l, i) => (
                <tr key={i} className="border-b border-line last:border-0">
                  <td className="py-3 text-sm text-ink-muted font-light">{l.label}</td>
                  <td className="py-3 text-sm text-ink text-right whitespace-nowrap">₹{l.amount.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="pt-4 font-serif text-lg text-ink">Total</td>
                <td className="pt-4 font-serif text-2xl text-ink text-right">₹{quote.total.toLocaleString("en-IN")}</td>
              </tr>
            </tfoot>
          </table>

          {quote.notes && (
            <p className="mt-5 text-sm text-ink-muted font-light whitespace-pre-line border-t border-line pt-4">{quote.notes}</p>
          )}
          {quote.validUntil && (
            <p className="mt-3 text-xs text-ink-faint">Valid until {quote.validUntil}</p>
          )}
        </div>

        <div className="bg-panel-soft border-t border-line p-6 sm:p-8 no-print">
          <QuoteActions token={quote.token} initialStatus={quote.status} />
          <div className="mt-3"><PrintButton /></div>
          <p className="text-[11px] text-ink-faint text-center mt-4">No payment is taken online — accepting confirms your intent and our team will arrange payment securely.</p>
        </div>
      </div>
    </div>
  );
}
