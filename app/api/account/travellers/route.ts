import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";
import { encrypt, encryptionAvailable } from "@/lib/crypto";

export const dynamic = "force-dynamic";

// Passport numbers are never returned in the list — only the last 4 digits, for
// display. Use the [id]?reveal=1 endpoint to decrypt a single number on demand.
export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ loggedIn: false, travellers: [] });
  const rows = await prisma.traveller.findMany({
    where: { customerId: customer.id }, orderBy: { createdAt: "asc" },
    select: { id: true, fullName: true, dob: true, nationality: true, sex: true, passportLast4: true, passportExpiry: true },
  });
  return NextResponse.json({ loggedIn: true, travellers: rows });
}

export async function POST(req: NextRequest) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const fullName = String(body.fullName || "").trim();
  if (!fullName) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const passportNumber = String(body.passportNumber || "").replace(/\s/g, "").toUpperCase();
  let passportEnc: string | null = null;
  let passportLast4: string | null = null;
  if (passportNumber) {
    if (!encryptionAvailable()) {
      return NextResponse.json({ error: "Secure storage isn't configured — cannot save a passport number." }, { status: 501 });
    }
    passportEnc = encrypt(passportNumber);
    passportLast4 = passportNumber.slice(-4);
  }

  const t = await prisma.traveller.create({
    data: {
      customerId: customer.id, fullName,
      dob: body.dob ? String(body.dob).trim() : null,
      nationality: body.nationality ? String(body.nationality).trim() : null,
      sex: body.sex ? String(body.sex).trim().slice(0, 1).toUpperCase() : null,
      passportEnc, passportLast4,
      passportExpiry: body.passportExpiry ? String(body.passportExpiry).trim() : null,
    },
    select: { id: true, fullName: true, dob: true, nationality: true, sex: true, passportLast4: true, passportExpiry: true },
  });
  return NextResponse.json({ ok: true, traveller: t });
}
