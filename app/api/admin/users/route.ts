import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/admin/requireAdmin";
import { isAdminRole } from "@/lib/admin/roles";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(req: NextRequest) {
  const admin = await requireOwner(req);
  if (admin instanceof NextResponse) return admin;
  const users = await prisma.adminUser.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true, name: true, role: true, createdAt: true, lastLoginAt: true },
  });
  return NextResponse.json({ users, meId: admin.id });
}

export async function POST(req: NextRequest) {
  const admin = await requireOwner(req);
  if (admin instanceof NextResponse) return admin;
  const { email, password, name, role } = await req.json().catch(() => ({}));
  if (!email || !EMAIL_RE.test(email)) return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  if (!password || password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

  const normalized = email.trim().toLowerCase();
  if (await prisma.adminUser.findUnique({ where: { email: normalized } })) {
    return NextResponse.json({ error: "An admin with that email already exists" }, { status: 409 });
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.adminUser.create({
    data: { email: normalized, passwordHash, name: name?.trim() || null, role: isAdminRole(role) ? role : "staff" },
    select: { id: true, email: true, name: true, role: true },
  });
  return NextResponse.json({ user }, { status: 201 });
}
