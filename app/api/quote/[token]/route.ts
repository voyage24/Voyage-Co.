import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public: a client accepts or declines a quote via its private token link.
export async function POST(req: Request, { params }: { params: { token: string } }) {
  const { action } = await req.json().catch(() => ({}));
  if (action !== "accept" && action !== "decline") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
  const quote = await prisma.quote.findUnique({ where: { token: params.token } });
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (quote.status === "accepted" || quote.status === "declined") {
    return NextResponse.json({ ok: true, status: quote.status });
  }
  const status = action === "accept" ? "accepted" : "declined";
  await prisma.quote.update({ where: { token: params.token }, data: { status, respondedAt: new Date() } });
  return NextResponse.json({ ok: true, status });
}
