import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { LIST_KEYS } from "@/lib/page-lists";

// Saves a whole repeatable list as a JSON string in the PageContent table,
// under its registered key. Mirrors /api/admin/page-content but for arrays.
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const body = await req.json().catch(() => ({}));
  const key = body?.key;
  const items = body?.items;

  if (typeof key !== "string" || !LIST_KEYS.has(key)) {
    return NextResponse.json({ error: "Unknown list" }, { status: 400 });
  }
  if (!Array.isArray(items)) {
    return NextResponse.json({ error: "Invalid items" }, { status: 400 });
  }

  const value = JSON.stringify(items);
  await prisma.pageContent.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });

  revalidateTag("page-content");
  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true });
}
