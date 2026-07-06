import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";
import { decrypt } from "@/lib/crypto";

export const dynamic = "force-dynamic";

// Decrypt and return one traveller's full passport number — owner only, on
// explicit request (?reveal=1), so the number isn't shipped with every list.
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (req.nextUrl.searchParams.get("reveal") !== "1") return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const t = await prisma.traveller.findFirst({ where: { id: params.id, customerId: customer.id }, select: { passportEnc: true } });
  if (!t) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ passportNumber: t.passportEnc ? decrypt(t.passportEnc) : null });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  await prisma.traveller.deleteMany({ where: { id: params.id, customerId: customer.id } });
  return NextResponse.json({ ok: true });
}
