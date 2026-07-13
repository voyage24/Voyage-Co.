import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentCustomer } from "@/lib/customer/session";
import PersonalExpenses from "@/components/account/PersonalExpenses";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Trip expenses — Voyages & Co." };

export default async function ExpensesPage({ searchParams }: { searchParams: { ref?: string } }) {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/login?next=/account/expenses");
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
      <div className="mb-8">
        <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-2">While you travel</p>
        <h1 className="font-serif text-3xl sm:text-4xl font-light text-ink">Trip expenses</h1>
        <p className="text-ink-muted font-light mt-2">Jot down what you spend as you go — it&apos;s grouped by category automatically, so you always know where the money went.</p>
      </div>
      <PersonalExpenses initialRef={searchParams.ref ?? ""} />
    </div>
  );
}
