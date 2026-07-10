import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, SESSION_COOKIE_NAME } from "@/lib/admin/session";
import { prisma } from "@/lib/prisma";

export async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = await getSessionUser(token);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return user;
}

// Owner-only APIs (team management). One waiver: while no owner exists yet
// (fresh install, pre-migration), the check passes so an owner can be
// bootstrapped at all.
export async function requireOwner(req: NextRequest) {
  const user = await requireAdmin(req);
  if (user instanceof NextResponse) return user;
  if (user.role !== "owner") {
    const owners = await prisma.adminUser.count({ where: { role: "owner" } });
    if (owners > 0) return NextResponse.json({ error: "Owner access required" }, { status: 403 });
  }
  return user;
}
