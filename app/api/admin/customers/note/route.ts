import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";

// Add or delete a staff note on a client (keyed by email).
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const { email, body } = await req.json().catch(() => ({}));
  if (!email || !body || !String(body).trim()) return NextResponse.json({ error: "Email and note text are required" }, { status: 400 });
  const note = await prisma.customerNote.create({
    data: { email: String(email).toLowerCase().trim(), body: String(body).trim(), author: admin.name || admin.email },
  });
  return NextResponse.json({ ok: true, note });
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.customerNote.delete({ where: { id } }).catch(() => {});
  return NextResponse.json({ ok: true });
}
