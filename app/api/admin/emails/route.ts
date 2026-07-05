import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { EMAIL_KEYS } from "@/lib/email/email-templates";
import { logAudit } from "@/lib/admin/audit";

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const body = await req.json().catch(() => ({}));
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const entries = Object.entries(body).filter(([k]) => EMAIL_KEYS.has(k));
  await Promise.all(
    entries.map(([key, value]) =>
      prisma.pageContent.upsert({
        where: { key },
        create: { key, value: String(value ?? "") },
        update: { value: String(value ?? "") },
      }),
    ),
  );

  revalidateTag("page-content");
  await logAudit(admin.email, "save", "emails");
  return NextResponse.json({ ok: true });
}
