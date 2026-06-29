import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { code } = await req.json().catch(() => ({}));
  if (!code || typeof code !== "string") return NextResponse.json({ found: false });
  const card = await prisma.giftCard.findUnique({ where: { code: code.trim().toUpperCase() } });
  if (!card) return NextResponse.json({ found: false });
  return NextResponse.json({ found: true, balance: card.balance, amount: card.amount, status: card.status, currency: card.currency });
}
