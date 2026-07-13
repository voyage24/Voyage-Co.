import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";
import { getMembership, displayName } from "@/lib/group/access";
import { notifyGroup } from "@/lib/group/notify";

export const dynamic = "force-dynamic";

// POST — add an item (hotel/experience/…) to the group's shortlist for voting.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  if (!(await getMembership(params.id, customer.id))) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const { type, id, title, image, href, price } = await req.json().catch(() => ({}));
  if (!type || !id || !title || !href) return NextResponse.json({ error: "Missing item" }, { status: 400 });

  const existing = await prisma.groupShortlistItem.findFirst({ where: { groupId: params.id, type, itemId: id } });
  if (existing) return NextResponse.json({ ok: true, id: existing.id });

  const cleanTitle = String(title).slice(0, 160);
  const created = await prisma.groupShortlistItem.create({
    data: { groupId: params.id, type, itemId: id, title: cleanTitle, image: image || null, href, price: typeof price === "number" ? Math.round(price) : null, addedById: customer.id },
  });
  const who = displayName(customer.name, customer.email);
  await notifyGroup(params.id, customer.id, "✨ New idea to vote on", `${who} proposed ${cleanTitle}`).catch(() => {});
  return NextResponse.json({ ok: true, id: created.id });
}
