import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { PAGE_CONTENT_KEYS } from "@/lib/page-content";
import { logAudit } from "@/lib/admin/audit";

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const body = await req.json().catch(() => ({}));
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const entries = Object.entries(body).filter(([k]) => PAGE_CONTENT_KEYS.has(k));
  await Promise.all(
    entries.map(([key, value]) =>
      prisma.pageContent.upsert({
        where: { key },
        create: { key, value: String(value ?? "") },
        update: { value: String(value ?? "") },
      })
    )
  );

  revalidateTag("page-content");
  revalidatePath("/", "layout");

  await logAudit(admin.email, "save", "page-content", null, `${entries.length} field(s)`);
  return NextResponse.json({ ok: true });
}
