import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Add another admin team member.
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const { email, password } = await req.json().catch(() => ({}));
  if (!email || typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }
  const normalized = email.trim().toLowerCase();
  const existing = await prisma.adminUser.findUnique({ where: { email: normalized } });
  if (existing) {
    return NextResponse.json({ error: "An admin with that email already exists" }, { status: 409 });
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.adminUser.create({ data: { email: normalized, passwordHash } });
  return NextResponse.json({ ok: true });
}

// Remove an admin (cannot remove yourself).
export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const { id } = await req.json().catch(() => ({}));
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Admin id required" }, { status: 400 });
  }
  if (id === admin.id) {
    return NextResponse.json({ error: "You cannot remove your own account" }, { status: 400 });
  }
  const count = await prisma.adminUser.count();
  if (count <= 1) {
    return NextResponse.json({ error: "Cannot remove the only admin" }, { status: 400 });
  }
  await prisma.adminUser.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
