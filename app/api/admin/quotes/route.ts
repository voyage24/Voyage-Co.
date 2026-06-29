import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";

type Line = { label: string; amount: number };

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const quotes = await prisma.quote.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ quotes });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const data = await req.json();
  if (!data.customerName || !data.customerEmail || !data.title) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const lineItems: Line[] = (Array.isArray(data.lineItems) ? data.lineItems : [])
    .filter((l: Line) => l?.label).map((l: Line) => ({ label: String(l.label), amount: Number(l.amount) || 0 }));
  const total = lineItems.reduce((s, l) => s + l.amount, 0);

  const quote = await prisma.quote.create({
    data: {
      token: crypto.randomBytes(9).toString("base64url"),
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      title: data.title,
      lineItems,
      total,
      notes: data.notes || null,
      validUntil: data.validUntil || null,
      status: data.status || "draft",
    },
  });
  return NextResponse.json({ quote }, { status: 201 });
}
