import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";

export const dynamic = "force-dynamic";

const TYPES = ["hotel", "package", "experience", "cruise"];

// Current price of a saveable item, by type (nightly / per-person).
async function currentPrice(type: string, id: string): Promise<number | null> {
  try {
    if (type === "hotel") return (await prisma.hotel.findUnique({ where: { id }, select: { pricePerNight: true } }))?.pricePerNight ?? null;
    if (type === "experience") return (await prisma.experience.findUnique({ where: { id }, select: { price: true } }))?.price ?? null;
    if (type === "package") return (await prisma.package.findUnique({ where: { id }, select: { pricePerPerson: true } }))?.pricePerPerson ?? null;
    if (type === "cruise") return (await prisma.cruise.findUnique({ where: { id }, select: { pricePerPerson: true } }))?.pricePerPerson ?? null;
  } catch { /* ignore */ }
  return null;
}

// Returns the signed-in customer's saved items (and whether they're signed in).
export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ loggedIn: false, items: [] });
  const items = await prisma.savedItem.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ loggedIn: true, items });
}

export async function POST(req: Request) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Please sign in to save" }, { status: 401 });
  const { type, itemId, itemTitle, image, href } = await req.json().catch(() => ({}));
  if (!TYPES.includes(type) || !itemId || !itemTitle || !href) {
    return NextResponse.json({ error: "Invalid item" }, { status: 400 });
  }
  // Capture the current price so we can flag drops later.
  const priceAtSave = await currentPrice(type, itemId);
  await prisma.savedItem.upsert({
    where: { customerId_type_itemId: { customerId: customer.id, type, itemId } },
    create: { customerId: customer.id, type, itemId, itemTitle, image: image || null, href, priceAtSave },
    update: {},
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const { type, itemId } = await req.json().catch(() => ({}));
  if (!type || !itemId) return NextResponse.json({ error: "Invalid item" }, { status: 400 });
  await prisma.savedItem.deleteMany({ where: { customerId: customer.id, type, itemId } });
  return NextResponse.json({ ok: true });
}
