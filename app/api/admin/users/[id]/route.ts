import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { logAudit } from "@/lib/admin/audit";
import { isAdminRole } from "@/lib/admin/roles";

// Edit a team member: name, role, and optionally a new password.
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const target = await prisma.adminUser.findUnique({ where: { id: params.id }, select: { id: true, email: true, role: true } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { name, role, password } = await req.json().catch(() => ({}));
  const data: { name?: string | null; role?: string; passwordHash?: string } = {};

  if (name !== undefined) data.name = String(name).trim() || null;

  if (role !== undefined && role !== target.role) {
    if (!isAdminRole(role)) return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    // You can't change your own role — another owner has to.
    if (target.id === admin.id) return NextResponse.json({ error: "You can't change your own role" }, { status: 400 });
    // Never demote the last owner, or nobody can manage the team.
    if (target.role === "owner" && role !== "owner") {
      const owners = await prisma.adminUser.count({ where: { role: "owner" } });
      if (owners <= 1) return NextResponse.json({ error: "Can't demote the last owner" }, { status: 400 });
    }
    data.role = role;
  }

  if (password !== undefined && String(password).length > 0) {
    if (String(password).length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    data.passwordHash = await bcrypt.hash(String(password), 12);
  }

  if (Object.keys(data).length === 0) return NextResponse.json({ ok: true });

  await prisma.adminUser.update({ where: { id: target.id }, data });
  const changes = [data.name !== undefined && "name", data.role && `role → ${data.role}`, data.passwordHash && "password reset"].filter(Boolean).join(", ");
  await logAudit(admin.email, "update", "admin-user", target.id, `${target.email}: ${changes}`);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  if (params.id === admin.id) return NextResponse.json({ error: "You can't remove your own account" }, { status: 400 });
  const count = await prisma.adminUser.count();
  if (count <= 1) return NextResponse.json({ error: "Can't remove the last admin" }, { status: 400 });
  // Never remove the last owner either.
  const target = await prisma.adminUser.findUnique({ where: { id: params.id }, select: { email: true, role: true } });
  if (target?.role === "owner") {
    const owners = await prisma.adminUser.count({ where: { role: "owner" } });
    if (owners <= 1) return NextResponse.json({ error: "Can't remove the last owner" }, { status: 400 });
  }
  await prisma.adminUser.delete({ where: { id: params.id } });
  await logAudit(admin.email, "delete", "admin-user", params.id, target?.email);
  return NextResponse.json({ ok: true });
}
