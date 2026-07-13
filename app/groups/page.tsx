import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentCustomer } from "@/lib/customer/session";
import GroupsHome from "@/components/groups/GroupsHome";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Group trips — Voyages & Co." };

export default async function GroupsPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/login?next=/groups");
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
      <div className="mb-8">
        <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-2">Travel together</p>
        <h1 className="font-serif text-3xl sm:text-4xl font-light text-ink">Group trips</h1>
        <p className="text-ink-muted font-light mt-2">Plan as a group — shortlist and vote on stays, split expenses, chat, share photos and see everyone&apos;s bookings in one place.</p>
      </div>
      <GroupsHome />
    </div>
  );
}
