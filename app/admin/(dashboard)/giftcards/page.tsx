import { prisma } from "@/lib/prisma";
import GiftCardsManager from "@/components/admin/GiftCardsManager";

export const dynamic = "force-dynamic";

export default async function AdminGiftCardsPage() {
  const cards = await prisma.giftCard.findMany({ orderBy: { createdAt: "desc" }, take: 500 });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">Gift Cards</h1>
      <p className="text-sm text-gray-500 mb-5">Issue gift cards, share the code, and track balances. Requests from the website appear in Enquiries.</p>
      <GiftCardsManager cards={cards} />
    </div>
  );
}
