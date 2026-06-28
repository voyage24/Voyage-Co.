import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";

const TYPES = ["hotel", "package", "experience", "cruise"];

export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ loggedIn: false, searches: [] });
  const searches = await prisma.savedSearch.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ loggedIn: true, searches });
}

export async function POST(req: Request) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Please sign in" }, { status: 401 });

  const { type, label, href, criteria } = await req.json().catch(() => ({}));
  if (!TYPES.includes(type)) return NextResponse.json({ error: "Invalid type" }, { status: 400 });

  const count = await prisma.savedSearch.count({ where: { customerId: customer.id } });
  if (count >= 25) return NextResponse.json({ error: "You've reached the saved-search limit" }, { status: 400 });

  const search = await prisma.savedSearch.create({
    data: {
      customerId: customer.id,
      type,
      label: (typeof label === "string" && label.trim()) || `All ${type}s`,
      href: typeof href === "string" ? href.slice(0, 500) : `/${type}s`,
      criteria: criteria && typeof criteria === "object" ? criteria : {},
    },
  });
  return NextResponse.json({ ok: true, search });
}
