import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";

export const dynamic = "force-dynamic";

type Seed = { type: string; id: string; title: string; image?: string; href: string; price?: number };

// GET — the groups the member owns or belongs to.
export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ loggedIn: false, groups: [] });
  const rows = await prisma.groupMember.findMany({
    where: { customerId: customer.id },
    include: { group: { include: { _count: { select: { members: true } } } } },
    orderBy: { joinedAt: "desc" },
  });
  const groups = rows.map(r => ({ id: r.groupId, title: r.group.title, destination: r.group.destination, members: r.group._count.members, isOwner: r.group.ownerId === customer.id }));
  return NextResponse.json({ loggedIn: true, groups });
}

// POST — create a group. Optionally seed the shortlist from a planned trip.
export async function POST(req: Request) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  const { title, destination, seed } = await req.json().catch(() => ({}));
  const name = typeof title === "string" && title.trim() ? title.trim().slice(0, 120) : "Our group trip";

  const group = await prisma.groupTrip.create({
    data: {
      title: name,
      destination: typeof destination === "string" ? destination.slice(0, 120) : null,
      ownerId: customer.id,
      shareToken: crypto.randomBytes(9).toString("base64url"),
      members: { create: { customerId: customer.id, role: "owner" } },
    },
  });

  if (Array.isArray(seed) && seed.length) {
    const items = (seed as Seed[]).filter(s => s?.type && s?.id && s?.title && s?.href).slice(0, 12);
    if (items.length) {
      await prisma.groupShortlistItem.createMany({
        data: items.map(s => ({ groupId: group.id, type: s.type, itemId: s.id, title: s.title.slice(0, 160), image: s.image || null, href: s.href, price: typeof s.price === "number" ? Math.round(s.price) : null, addedById: customer.id })),
      });
    }
  }

  return NextResponse.json({ ok: true, id: group.id });
}
