import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";

const genCode = () => `VC-${crypto.randomBytes(2).toString("hex").toUpperCase()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const giftcards = await prisma.giftCard.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ giftcards });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const data = await req.json();
  const amount = Number(data.amount) || 0;
  if (amount <= 0) return NextResponse.json({ error: "Enter an amount" }, { status: 400 });

  // Retry on the rare code collision.
  for (let i = 0; i < 5; i++) {
    try {
      const card = await prisma.giftCard.create({
        data: {
          code: genCode(),
          amount,
          balance: amount,
          recipientName: data.recipientName || null,
          recipientEmail: data.recipientEmail || null,
          senderName: data.senderName || null,
          message: data.message || null,
        },
      });
      return NextResponse.json({ card }, { status: 201 });
    } catch (err) {
      if (i === 4) { console.error("Gift card create failed:", err); return NextResponse.json({ error: "Could not issue card" }, { status: 500 }); }
    }
  }
}
