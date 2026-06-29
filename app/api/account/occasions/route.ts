import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";

export async function PUT(req: Request) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  const { birthday, anniversary } = await req.json().catch(() => ({}));
  const ok = (v: unknown) => v === "" || v == null || (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v));
  if (!ok(birthday) || !ok(anniversary)) return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  await prisma.customer.update({
    where: { id: customer.id },
    data: { birthday: birthday || null, anniversary: anniversary || null },
  });
  return NextResponse.json({ ok: true });
}
